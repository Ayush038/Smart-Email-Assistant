"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import StatsCardSkeleton from "@/components/StatsCardSkeleton";
import EmailCard from "@/components/EmailCard";
import EmailCardSkeleton from "@/components/EmailCardSkeleton";
import AIOverviewCard from "@/components/AIOverviewCard";
import AIOverviewSkeleton from "@/components/AIOverviewSkeleton";
import InsightCard from "@/components/InsightCard";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [recentDigest, setRecentDigest] = useState(null);
  const [urgentDigest, setUrgentDigest] = useState(null);

  useEffect(() => {
    apiFetch("/emails/inbox")
      .then(setEmails)
      .catch(console.error)
      .finally(() => setLoadingEmails(false));
  }, []);

  useEffect(() => {
    apiFetch("/emails/aggregate/recent?limit=5")
      .then(setRecentDigest)
      .catch(console.error);

    apiFetch("/emails/aggregate/urgent")
      .then(setUrgentDigest)
      .catch(console.error);
  }, []);

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setLoadingSummary(true);
    setSummary(null);

    try {
      const result = await apiFetch(
        `/emails/${email._id}/summarize`,
        { method: "POST" }
      );
      setSummary(result);
    } catch (err) {
      console.error(err);
      setSummary({ error: "Failed to generate summary" });
    } finally {
      setLoadingSummary(false);
    }
  };

  const mapEmail = (e) => ({
    id: e._id,
    original: e,
    sender: e.sender,
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

  const uiEmails = emails.slice(0, 3).map(mapEmail);

  const urgentCount = emails.filter(
    (e) => (e.priority_score || 0) >= 7
  ).length;

  const highPriorityCount = emails.filter((e) => {
    const score = e.priority_score || 0;
    return score >= 5 && score < 7;
  }).length;

  const unsummarizedCount = emails.filter(
    (e) => !e.summary
  ).length;

  const spamCount = emails.filter(
    (e) => e.category === "Spam"
  ).length;

  const categoryStats = emails.reduce((acc, email) => {
    const cat = email.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* =========================
          Stats Row
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loadingEmails
          ? Array.from({ length: 5 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))
          : (
            <>
              <StatsCard
                title="Inbox"
                value={emails.length}
                gradient="from-blue-600/40 to-purple-600/40"
              />

              <StatsCard
                title="Urgent"
                value={urgentCount}
                gradient="from-red-600/40 to-pink-600/40"
              />

              <StatsCard
                title="High Priority"
                value={highPriorityCount}
                gradient="from-yellow-500/40 to-orange-500/40"
              />

              <StatsCard
                title="Need Summary"
                value={unsummarizedCount}
                gradient="from-cyan-600/40 to-blue-500/40"
              />

              <StatsCard
                title="Spam"
                value={spamCount}
                gradient="from-purple-600/40 to-indigo-600/40"
              />
            </>
          )}
      </div>

      {/* =========================
          Middle Section
      ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Inbox */}
        <div className="lg:col-span-2 glass glass-hover rounded-xl p-3 lg:p-4 flex flex-col min-h-[320px] lg:h-[420px]">

          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Inbox
          </h2>

          <div className="space-y-3 overflow-y-auto flex-1 scrollbar-glass">

            {loadingEmails &&
              Array.from({ length: 3 }).map((_, i) => (
                <EmailCardSkeleton key={i} />
              ))}

            {!loadingEmails && uiEmails.length === 0 && (
              <p className="text-zinc-400">No emails yet</p>
            )}

            {!loadingEmails &&
              uiEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.original)}
                  className="cursor-pointer hover:scale-[1.01] transition"
                >
                  <EmailCard {...email} />
                </div>
              ))}
          </div>
        </div>

        {/* AI Overview */}
        <div className="glass glass-hover rounded-xl p-3 lg:p-4 flex flex-col min-h-[320px] lg:h-[420px]">

          <h2 className="text-lg font-semibold text-white mb-4">
            Email Overview
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-glass">

            {!selectedEmail && (
              <p className="text-zinc-400">
                Select an email to view summary
              </p>
            )}

            {loadingSummary && <AIOverviewSkeleton />}

            {summary?.error && (
              <p className="text-red-400">{summary.error}</p>
            )}

            {summary && !loadingSummary && !summary.error && (
              <>
                <AIOverviewCard title="Summary">
                  <p>{summary.summary}</p>
                </AIOverviewCard>

                <AIOverviewCard title="Action Items">
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.action_items?.length > 0
                      ? summary.action_items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))
                      : <li>No action items</li>}
                  </ul>
                </AIOverviewCard>

                <AIOverviewCard title="Entities & Intent">
                  <p>
                    <span className="text-zinc-400">Entities:</span>{" "}
                    {summary.entities?.join(", ") || "None"}
                  </p>
                  <p>
                    <span className="text-zinc-400">Intent:</span>{" "}
                    {summary.intent || "Unknown"}
                  </p>
                </AIOverviewCard>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================
          Insights
      ========================= */}

      <div className="glass glass-hover rounded-xl p-3 lg:p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <InsightCard title="Category Distribution">
            {Object.entries(categoryStats).length === 0 ? (
              <p className="text-zinc-500">No data</p>
            ) : (
              Object.entries(categoryStats).map(([cat, count]) => (
                <p key={cat} className="text-sm">
                  <span className="text-purple-300">{cat}</span>: {count}
                </p>
              ))
            )}
          </InsightCard>

          <InsightCard title="Urgent Emails">
            {urgentDigest ? (
              <p className="text-sm">
                You have{" "}
                <span className="text-red-400 font-semibold">
                  {urgentDigest.used_emails || 0}
                </span>{" "}
                urgent emails
              </p>
            ) : (
              <p className="text-zinc-500">Loading...</p>
            )}
          </InsightCard>

          <InsightCard title="Recent Digest">
            {recentDigest ? (
              <p className="text-sm text-zinc-300 line-clamp-6">
                {recentDigest.digest || "No recent summary"}
              </p>
            ) : (
              <p className="text-zinc-500">Loading...</p>
            )}
          </InsightCard>

        </div>
      </div>
    </div>
  );
}