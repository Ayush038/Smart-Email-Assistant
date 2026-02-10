from fastmcp import Client


class ToolRegistry:
    def __init__(self, client: Client):
        self.client = client

    async def call_tool(self, tool_name: str, **kwargs):
        result = await self.client.call_tool(tool_name, kwargs)
        return result

    def list_tools(self):
        return {
            "classify_email": "Classifies a new email",
            "score_priority": "Scores email priority",
            "summarize_email": "Summarizes an email",
        }