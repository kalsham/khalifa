"""Starter Claude agent: a custom in-process tool plus an interactive loop.

Usage:
    export ANTHROPIC_API_KEY=...   # or put it in a .env file
    python agent.py
"""

import anyio

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    TextBlock,
    create_sdk_mcp_server,
    tool,
)


@tool("get_weather", "Get the current weather for a city", {"city": str})
async def get_weather(args: dict) -> dict:
    city = args["city"]
    # Replace with a real API call.
    return {"content": [{"type": "text", "text": f"It's sunny and 22°C in {city}."}]}


weather_server = create_sdk_mcp_server(
    name="tools",
    version="1.0.0",
    tools=[get_weather],
)

options = ClaudeAgentOptions(
    system_prompt="You are a concise, helpful assistant.",
    mcp_servers={"tools": weather_server},
    allowed_tools=["mcp__tools__get_weather"],
    permission_mode="acceptEdits",
)


async def main() -> None:
    async with ClaudeSDKClient(options=options) as client:
        print("Agent ready. Type a message (or 'exit' to quit).\n")
        while True:
            try:
                user_input = input("You: ").strip()
            except EOFError:
                break
            if user_input.lower() in {"exit", "quit"}:
                break
            if not user_input:
                continue

            await client.query(user_input)
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(f"Claude: {block.text}")


if __name__ == "__main__":
    anyio.run(main)
