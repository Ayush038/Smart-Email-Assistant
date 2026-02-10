from llm.llm_client import client


class AggregationService:
    def __init__(self, repo):
        self.repo = repo

    def _prepare_emails(self, emails: list[dict]) -> list[dict]:
        filtered = [
            e for e in emails
            if e.get("category") != "Spam"
        ]

        filtered.sort(
            key=lambda e: e.get("priority_score", 0),
            reverse=True
        )

        return filtered

    def _collect_summaries(self, emails: list[dict]) -> str:
        summaries = []

        for email in emails:
            summary = email.get("summary")

            if not summary:
                continue

            # Handle structured summary (dict format)
            if isinstance(summary, dict):
                text = summary.get("summary")
                if isinstance(text, str) and text.strip():
                    summaries.append(text.strip())

            # Handle legacy string summary
            elif isinstance(summary, str) and summary.strip():
                summaries.append(summary.strip())

        return "\n\n".join(summaries)

    def _call_llm(self, merged_text: str) -> str:
        prompt = f"""
You are an intelligent email assistant.

Combine the following email summaries into a concise digest.

Rules:
- Prioritize urgent or high-impact items first
- Ignore spam or promotional content
- Focus on actionable information

Return:
1. Overview
2. Key points (bullet list)
3. Action items (bullet list)

Email summaries:
{merged_text}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            timeout=10
        )

        return response.choices[0].message.content.strip()

    def aggregate_recent(
        self,
        user_email: str,
        limit: int = 10,
    ) -> dict:

        inbox_emails = self.repo.list_inbox(user_email)
        emails = self._prepare_emails(inbox_emails[:limit])

        merged_text = self._collect_summaries(emails)

        if not merged_text:
            return {
                "email_count": len(emails),
                "digest": "No summarized emails available yet."
            }

        digest = self._call_llm(merged_text)

        return {
            "email_count": len(emails),
            "digest": digest,
        }

    def aggregate_urgent(
        self,
        user_email: str,
        threshold: float = 7.0,
    ) -> dict:

        inbox_emails = self.repo.list_inbox(user_email)

        urgent = [
            e for e in inbox_emails
            if e.get("priority_score", 0) >= threshold
        ]

        emails = self._prepare_emails(urgent)

        merged_text = self._collect_summaries(emails)

        if not merged_text:
            return {
                "used_emails": len(emails),
                "digest": "No urgent summarized emails available yet."
            }

        digest = self._call_llm(merged_text)

        return {
            "used_emails": len(emails),
            "digest": digest,
        }