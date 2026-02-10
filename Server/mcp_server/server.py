from fastmcp import FastMCP
from dotenv import load_dotenv
load_dotenv()
from mcp_tools.classifier import EmailClassifier
from mcp_tools.ranker import PriorityScorer
from mcp_tools.summarizer import EmailSummarizer
import os

mcp = FastMCP("email-tools")

classifier = EmailClassifier()
ranker = PriorityScorer()
summarizer = EmailSummarizer()


@mcp.tool()
def classify_email(subject: str, body: str) -> dict:
    return classifier.run({"subject": subject, "body": body})


@mcp.tool()
def score_priority(subject: str, body: str, category: str | None = None) -> dict:
    return ranker.run({
        "subject": subject,
        "body": body,
        "category": category,
    })


@mcp.tool()
def summarize_email(subject: str, body: str) -> dict:
    return summarizer.run({"subject": subject, "body": body})

port = int(os.getenv("MCP_PORT", "8001"))


if __name__ == "__main__":
    mcp.run(transport="http", port=port)