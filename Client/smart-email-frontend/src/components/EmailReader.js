"use client";

import AIOverviewCard from "@/components/AIOverviewCard";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function EmailReader({ email, onDelete }) {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email) return;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      setError(null);

      try {
        const result = await apiFetch(
          `/emails/${email._id}/summarize`,
          { method: "POST" }
        );
        setSummary(result);
      } catch (err) {
        setError("Failed to load summary");
        console.error(err);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [email]);

  if (!email) {
    return (
      <div className="glass rounded-xl p-6 text-zinc-400">
        Select an email to read
      </div>
    );
  }

  const deleteEmail = async () => {
    if (!confirm("Delete this email?")) return;

    setDeleting(true);

    try {
      await apiFetch(`/emails/${email._id}`, {
        method: "DELETE",
      });

      onDelete?.();
    } catch (err) {
      setError("Failed to delete email");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const senderLabel =
    email.sender === email.receiver ? "Me" : email.sender;

  const receiverLabel =
    email.sender === email.receiver ? "Me" : email.receiver;

  return (
    <div className="glass rounded-xl p-6 flex flex-col gap-4 overflow-y-auto">

      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-semibold text-white">
          {email.subject}
        </h2>

        <p className="text-sm text-zinc-400">
          From: {senderLabel}
        </p>

        <p className="text-sm text-zinc-400">
          To: {receiverLabel}
        </p>

        <p className="text-sm text-zinc-500">
          {new Date(email.created_at).toLocaleString()}
        </p>

        <button
          onClick={deleteEmail}
          disabled={deleting}
          className="mt-3 px-3 py-1 bg-red-600 rounded hover:bg-red-700"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Body */}
      <div className="text-zinc-200 whitespace-pre-wrap">
        {email.body}
      </div>

      {/* Summary */}
      {loadingSummary && (
        <p className="text-zinc-400">Loading summary...</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {summary && (
        <>
          <AIOverviewCard title="Summary">
            <p>{summary.summary}</p>
          </AIOverviewCard>

          <AIOverviewCard title="Action Items">
            <ul className="list-disc pl-5">
              {summary.action_items?.length > 0
                ? summary.action_items.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))
                : <li>None</li>}
            </ul>
          </AIOverviewCard>

          <AIOverviewCard title="Entities & Intent">
            <p>Entities: {summary.entities?.join(", ") || "None"}</p>
            <p>Intent: {summary.intent}</p>
          </AIOverviewCard>
        </>
      )}
    </div>
  );
}