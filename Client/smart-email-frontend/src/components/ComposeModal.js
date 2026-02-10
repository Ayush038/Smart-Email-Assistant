"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { notifyEmailSent } from "@/lib/emailEvents";
import toast from "react-hot-toast";

export default function ComposeModal({ open, onClose }) {
  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const sendEmail = async () => {
    if (!receiver || !subject || !body) {
      toast.error("All fields are required");
      return;
    }

    setSending(true);
    const toastId = toast.loading("Sending email...");

    const res = await apiFetch("/emails/", {
      method: "POST",
      body: JSON.stringify({
        receiver,
        subject,
        body,
      }),
    });

    // 🔴 Handle API error (new model)
    if (res?.error) {
      toast.error(res.error, { id: toastId });
      setSending(false);
      return;
    }

    // 🟢 Success path
    toast.success("Email sent!", { id: toastId });

    notifyEmailSent();

    setReceiver("");
    setSubject("");
    setBody("");
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="glass p-6 rounded-xl w-[520px] space-y-4">

        <h2 className="text-lg font-semibold text-white">
          Compose Email
        </h2>

        <input
          placeholder="To"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full p-2 bg-white/10 rounded text-white"
        />

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 bg-white/10 rounded text-white"
        />

        <textarea
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 bg-white/10 rounded text-white h-36"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={sendEmail}
            disabled={sending}
            className="px-3 py-1 bg-blue-600 rounded"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}