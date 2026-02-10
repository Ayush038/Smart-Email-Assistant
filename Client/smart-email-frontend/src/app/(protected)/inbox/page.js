"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import EmailCard from "@/components/EmailCard";
import EmailCardSkeleton from "@/components/EmailCardSkeleton";
import AIOverviewCard from "@/components/AIOverviewCard";
import { subscribeEmailSent } from "@/lib/emailEvents";

export default function InboxPage() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  const listRef = useRef(null);

  const fetchInbox = () => {
    const scrollPos = listRef.current?.scrollTop || 0;

    setLoadingEmails(true);
    setError(null);

    apiFetch("/emails/inbox")
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setEmails(sorted);
        setPage(1);

        if (
          selectedEmail &&
          !sorted.find((e) => e._id === selectedEmail._id)
        ) {
          setSelectedEmail(null);
          setSummary(null);
        }
      })
      .catch(() => setError("Failed to load inbox"))
      .finally(() => {
        setLoadingEmails(false);
        requestAnimationFrame(() => {
          if (listRef.current) listRef.current.scrollTop = scrollPos;
        });
      });
  };

  useEffect(() => {
    fetchInbox();
    const unsubscribe = subscribeEmailSent(fetchInbox);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setSummary(null);
  }, [selectedEmail]);

  const generateSummary = async () => {
    if (!selectedEmail || loadingSummary) return;
    if (summary && summary.email_id === selectedEmail._id) return;

    setLoadingSummary(true);
    setSummary(null);

    try {
      const result = await apiFetch(
        `/emails/${selectedEmail._id}/summarize`,
        { method: "POST" }
      );

      setSummary({ ...result, email_id: selectedEmail._id });
    } catch {
      setSummary({ error: "Failed to generate summary" });
    } finally {
      setLoadingSummary(false);
    }
  };

  const requestDelete = () => {
    if (!selectedEmail || deleting) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmail || deleting) return;

    setDeleting(true);

    const res = await apiFetch(`/emails/${selectedEmail._id}`, {
      method: "DELETE",
    });

    if (res?.error) {
      alert(res.error);
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    setSelectedEmail(null);
    setSummary(null);
    setShowDeleteConfirm(false);
    fetchInbox();
    setDeleting(false);
  };

  const mapEmail = (e) => ({
    id: e._id,
    original: e,
    sender: e.sender === e.receiver ? "Me" : e.sender,
    subject: e.subject,
    preview: e.body?.slice(0, 80) || "",
    time: new Date(e.created_at).toLocaleString(),
    category: e.category || "General",
    priorityScore: e.priority_score || 0,
    badge:
      e.priority_score >= 7
        ? "Urgent"
        : e.priority_score >= 5
        ? "High Priority"
        : "Normal",
  });

  const uiEmails = emails.map(mapEmail);

  const totalPages = Math.ceil(uiEmails.length / PAGE_SIZE);

  const paginatedEmails = uiEmails.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">

      {/* Inbox List */}
      <div className="lg:col-span-2 glass glass-hover rounded-xl p-3 lg:p-4 flex flex-col min-h-[420px] lg:h-[640px]">
        <h2 className="text-lg font-semibold text-white mb-4">
          Inbox
        </h2>

        <div
          ref={listRef}
          className="space-y-3 overflow-y-auto flex-1 min-h-[460px]"
        >

          {loadingEmails &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <EmailCardSkeleton key={i} />
            ))}

          {error && (
            <p className="text-red-400">{error}</p>
          )}

          {!loadingEmails && !error && uiEmails.length === 0 && (
            <div className="text-center text-zinc-400 py-10">
              <p>No emails yet</p>
              <p className="text-sm">
                Compose a new message to get started
              </p>
            </div>
          )}

          {!loadingEmails &&
            paginatedEmails.map((email) => {
              const isActive =
                selectedEmail?._id === email.id;

              return (
                <div
                  key={email.id}
                  className={`glass-soft rounded-lg overflow-hidden transition ${
                    isActive
                      ? "ring-1 ring-blue-500/50"
                      : "hover:scale-[1.01]"
                  }`}
                >
                  <div
                    onClick={() => setSelectedEmail(email.original)}
                    className="cursor-pointer"
                  >
                    <EmailCard {...email} />
                  </div>
                </div>
              );
            })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm text-zinc-300">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-zinc-700 rounded disabled:opacity-40 hover:bg-zinc-600"
            >
              Previous
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="px-3 py-1 bg-zinc-700 rounded disabled:opacity-40 hover:bg-zinc-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Reader Panel */}
      <div className="glass glass-hover rounded-xl p-3 lg:p-4 flex flex-col gap-3 lg:gap-4 overflow-y-auto">

        {!selectedEmail && (
          <p className="text-zinc-400">
            Select an email to view
          </p>
        )}

        {selectedEmail && (
          <>
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-xl font-semibold text-white">
                {selectedEmail.subject}
              </h2>

              <p className="text-sm text-zinc-400">
                From:{" "}
                {selectedEmail.sender === selectedEmail.receiver
                  ? "Me"
                  : selectedEmail.sender}
              </p>

              <p className="text-sm text-zinc-400">
                To:{" "}
                {selectedEmail.sender === selectedEmail.receiver
                  ? "Me"
                  : selectedEmail.receiver}
              </p>

              <p className="text-sm text-zinc-500">
                {new Date(
                  selectedEmail.created_at
                ).toLocaleString()}
              </p>

              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={generateSummary}
                  disabled={loadingSummary}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingSummary
                    ? "Generating..."
                    : "Summaries"}
                </button>

                <button
                  onClick={requestDelete}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            <div className="text-zinc-200 whitespace-pre-wrap">
              {selectedEmail.body}
            </div>

            {summary?.error && (
              <p className="text-red-400">
                {summary.error}
              </p>
            )}

            {summary && !summary.error && (
              <>
                <AIOverviewCard title="Summary">
                  <p>{summary.summary}</p>
                </AIOverviewCard>

                <AIOverviewCard title="Action Items">
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.action_items?.length > 0
                      ? summary.action_items.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))
                      : <li>No action items</li>}
                  </ul>
                </AIOverviewCard>

                <AIOverviewCard title="Entities & Intent">
                  <p>
                    Entities:{" "}
                    {summary.entities?.join(", ") ||
                      "None"}
                  </p>
                  <p>
                    Intent:{" "}
                    {summary.intent || "Unknown"}
                  </p>
                </AIOverviewCard>
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="glass glass-hover rounded-xl p-6 w-[90%] max-w-[380px] space-y-4 shadow-2xl">

            <h3 className="text-lg font-semibold text-white">
              Delete Email?
            </h3>

            <p className="text-sm text-zinc-400">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}