import json
from llm.openai_client import client


class EmailSummarizer:
    def run(self, input_data: dict) -> dict:
        subject = input_data["subject"]
        body = input_data["body"]

        prompt = f"""
Summarize this email and extract structure.

Return ONLY valid JSON:

{{
  "summary": "1-2 sentence summary",
  "action_items": ["list of actions or empty list"],
  "intent": "short label",
  "entities": ["important nouns"]
}}

Email:
Subject: {subject}
Body: {body}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            timeout=8,
        )

        text = response.choices[0].message.content.strip()

        try:
            return json.loads(text)
        except Exception:
            return {
                "summary": "Summary unavailable",
                "action_items": [],
                "intent": "unknown",
                "entities": [],
            }