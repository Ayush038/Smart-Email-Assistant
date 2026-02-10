import json
from llm.openai_client import client


class EmailClassifier:
    def run(self, input_data: dict) -> dict:
        subject = input_data["subject"]
        body = input_data["body"]

        prompt = f"""
Classify the following email.

Return ONLY valid JSON in this format:
{{
  "category": "Work | Personal | Finance | Promotions | Updates | Spam",
  "confidence": 0.0-1.0,
  "reason": "short explanation"
}}

Email:
Subject: {subject}
Body: {body}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            timeout=8,
        )

        text = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(text)
            return {"category": parsed["category"]}
        except Exception:
            return {"category": "Personal"}