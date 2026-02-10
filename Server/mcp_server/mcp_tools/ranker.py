import json
from llm.openai_client import client


class PriorityScorer:
    def _rule_score(self, subject: str, body: str, category: str | None) -> float:
        text = f"{subject} {body}".lower()

        score = 1.0

        urgent_words = ["urgent", "asap", "immediately", "deadline", "critical"]
        important_words = ["meeting", "project", "client", "review"]

        for word in urgent_words:
            if word in text:
                score += 4

        for word in important_words:
            if word in text:
                score += 2

        if category == "Finance":
            score += 2
        elif category == "Promotions":
            score -= 2
        elif category == "Spam":
            score = 0

        return max(0, min(score, 10.0))

    def _llm_refine(
        self,
        subject: str,
        body: str,
        base_score: float
    ) -> dict | None:

        prompt = f"""
Assess the urgency of this email.

Return ONLY valid JSON:
{{
  "adjustment": -5.0 to +5.0,
  "urgency": "low | medium | high",
  "factors": ["short reasons"]
}}

The base score is only a rough hint. You may ignore it.

Interpret adjustment as:
0 = neutral urgency (score 5)
+5 = extremely urgent (score 10)
-5 = not urgent (score 0)

Base score (hint only): {base_score}

Email:
Subject: {subject}
Body: {body}
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                timeout=8,
            )

            text = response.choices[0].message.content.strip()
            return json.loads(text)

        except Exception:
            return None

    def run(self, input_data: dict) -> dict:
        subject = input_data["subject"]
        body = input_data["body"]
        category = input_data.get("category")

        base_score = self._rule_score(subject, body, category)

        if category == "Spam":
            return {
                "priority_score": 0,
                "urgency": "low",
                "factors": ["spam detected"],
            }

        llm_data = self._llm_refine(subject, body, base_score)

        if llm_data:
            try:
                adjustment = float(llm_data.get("adjustment", 0))
            except Exception:
                adjustment = 0

            adjustment = max(-5.0, min(adjustment, 5.0))

            urgency = llm_data.get("urgency", "medium")
            factors = llm_data.get("factors", [])

            final_score = 5.0 + adjustment
            final_score = max(0, min(final_score, 10.0))

            return {
                "priority_score": final_score,
                "urgency": urgency,
                "factors": factors,
            }

        return {
            "priority_score": base_score,
            "urgency": "medium",
            "factors": ["rule-based scoring"],
        }