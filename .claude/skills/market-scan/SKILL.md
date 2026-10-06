---
name: market-scan
description: Run the read-only market-analyst agent over the Liquid connector. Use for "/market-scan", "/market-scan BTC", "/market-scan BTC ETH SOL", or "/market-scan portfolio".
---

Delegate to the `market-analyst` subagent (Agent tool, `subagent_type: market-analyst`).

Build its prompt from the arguments:

- No arguments → "Run a full market scan."
- One symbol → "Do a single-asset analysis of <SYMBOL>."
- Several symbols → "Compare these markets: <SYMBOLS>."
- `portfolio` → "Review my portfolio and open orders."
- Add "Save the report." if the arguments include `--save`.

Relay the agent's report to the user verbatim (it is not shown to them otherwise). Do not place or suggest executing trades from this skill; if the user wants to act on a setup, that is a separate request requiring their explicit approval of the exact order.

Prerequisite: the **Liquid** connector must be connected in claude.ai (Settings → Connectors). If the agent reports that the Liquid tools are unavailable, tell the user to connect it.
