import asyncio
from fastmcp import Client


async def main():
    async with Client("http://localhost:8001/mcp") as client:
        result = await client.call_tool(
        "score_priority",
        {
            "subject": "Payment deadline tomorrow",
            "body": "Invoice must be paid immediately.",
            "category": "Finance",
        },
    )

    print(result.data)


asyncio.run(main())