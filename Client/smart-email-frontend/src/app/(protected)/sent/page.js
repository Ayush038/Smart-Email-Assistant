"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import EmailCard from "@/components/EmailCard";
import { subscribeEmailSent } from "@/lib/emailEvents";

const PAGE_SIZE = 5;

export default function SentPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const fetchSent = () => {
    setLoading(true);

    apiFetch("/emails/sent")
      .then((data) => {
        setEmails(data);
        setPage(1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSent();
    const unsubscribe = subscribeEmailSent(fetchSent);
    return unsubscribe;
  }, []);

  // Lock background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selected]);

  const mapEmail = (e) => ({
    id: e._id,
    sender: e.sender === e.receiver ? "Me" : e.receiver,
    subject: e.subject,
    preview: e.body?.slice(0, 80) || "",
    time: new Date(e.created_at).toLocaleString(),
    badge: null,
    raw: e,
  });

  const uiEmails = emails.map(mapEmail);

  // Pagination logic
  const totalPages = Math.ceil(uiEmails.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = uiEmails.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-semibold text-white">
        Sent Emails
      </h1>

      {loading && (
        <p className="text-zinc-400">Loading sent emails...</p>
      )}

      {!loading && uiEmails.length === 0 && (
        <p className="text-zinc-400">No sent emails</p>
      )}

      {/* Card list wrapper */}
      {!loading && paginated.length > 0 && (
        <div className="glass-soft rounded-2xl divide-y divide-white/5">

          {paginated.map((email) => (
            <EmailCard
              key={email.id}
              {...email}
              mode="sent"
              onClick={() => setSelected(email.raw)}
            />
          ))}

        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-lg text-white"
          >
            Prev
          </button>

          <span className="px-3 py-1 text-zinc-300">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-lg text-white"
          >
            Next
          </button>

        </div>
      )}

      {/* Modal viewer */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[20000]"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white">
              {selected.subject}
            </h2>

            <p className="text-sm text-zinc-400">
              To: {selected.receiver}
            </p>

            <p className="text-sm text-zinc-400">
              {new Date(selected.created_at).toLocaleString()}
            </p>

            <div className="border-t border-white/10 pt-4 whitespace-pre-wrap text-white">
              {selected.body}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}