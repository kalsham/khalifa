# khalifa

Starter project for building an agent with the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set your API key (copy `.env.example` to `.env` and fill it in, or export it directly):

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

Node.js is also required — the SDK drives the Claude Code CLI under the hood.

## Run

```bash
python agent.py
```

This starts an interactive loop. `agent.py` shows the minimum pieces of an agent:

- a custom tool (`get_weather`) defined with `@tool` and exposed via an in-process MCP server (`create_sdk_mcp_server`)
- `ClaudeAgentOptions` to set the system prompt, register the tool server, and control permissions
- `ClaudeSDKClient` to run a multi-turn conversation loop

Extend it by adding more `@tool`-decorated functions to `weather_server`'s `tools` list and including their names in `allowed_tools`.
