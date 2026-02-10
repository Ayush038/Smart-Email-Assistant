import json
from llm.llm_client import client


def plan_tools(subject: str, body: str, tool_list: dict) -> list[dict]:
    tool_descriptions = "\n".join(
        [f"- {name}: {desc}" for name, desc in tool_list.items()]
    )

    prompt = f"""
You are an agent that selects tools to process an email.

Available tools:
{tool_descriptions}

Email:
Subject: {subject}
Body: {body}

Return a JSON list of tools to run in order.
Example:
[
  {{"tool": "classify_email"}},
  {{"tool": "score_priority"}}
]
Never invent tool names. Only use tools from the list.

Only return JSON.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    text = response.choices[0].message.content.strip()

    try:
        return json.loads(text)
    except Exception:
        return []