# agent-ci-zero-api

[![ci](https://github.com/nkwib/agent-ci-zero-api/actions/workflows/ci.yml/badge.svg)](https://github.com/nkwib/agent-ci-zero-api/actions/workflows/ci.yml)

Agent CI that never hits an API. Record an AI SDK agent run once as a cassette, commit it, and every CI run after that replays it offline: deterministic, zero tokens, zero secrets. If the prompt, tool schema, or sampling params drift from the recording, replay misses and CI fails loudly instead of silently testing stale behavior.

Built on [`@nkwib/tapedeck`](https://github.com/nkwib/tapedeck) (record/replay middleware for the Vercel AI SDK, docs at [tapedeck.pages.dev](https://tapedeck.pages.dev)) and `ai@7`.

## Quickstart

```bash
npm install
npm test          # replays the committed cassette: offline, no API key, green
```

That is the whole CI story. [`ci.yml`](.github/workflows/ci.yml) is `npm ci && npm test` with no secrets configured anywhere.

To re-record after changing the agent:

```bash
npm run record                              # scripted model, offline, no key needed
ANTHROPIC_API_KEY=sk-... npm run record:real  # same flow against live claude-haiku-4-5
```

## How it works

| Piece | Role |
|-------|------|
| [`src/agent.ts`](src/agent.ts) | The agent under test: `generateText`, one `lookupOrder` tool, multi-step (`stopWhen: stepCountIs(3)`). The model is injected, so record scripts and the test share one implementation. |
| [`src/model.ts`](src/model.ts) | Wraps any model with `cassetteMiddleware` via `wrapLanguageModel`. Default mode is replay: nothing in this repo touches the network unless you ask it to. |
| [`scripts/record.ts`](scripts/record.ts) | Runs the agent once in record mode and writes [`cassettes/order-lookup.json`](cassettes/order-lookup.json): 2 interactions (tool call, then final answer), hash-addressed by model identity, prompt, tool schemas, and sampling params. |
| [`test/agent.test.ts`](test/agent.test.ts) | `withCassette('order-lookup.json', ...)` pins the test to the cassette and forces replay. Asserts the tool call, the step count, and the final text. A second test proves drift detection: a changed prompt misses the cassette and throws `CassetteMissError`. |

```
record (once)                      replay (every CI run)
model --> middleware --> cassette  cassette --> middleware --> test
        writes JSON                    no network, no tokens
```

The cassette key is a hash of `{ modelProvider, modelId, prompt, toolSchemas, maxOutputTokens, temperature, topP }`. Same request, same response, forever. Different request, `CassetteMissError`, red CI, re-record.

## Honesty note

The committed cassettes were recorded against a scripted model (`MockLanguageModelV4` impersonating `anthropic.messages / claude-haiku-4-5`) so this repo works out of the box with no API key; `ANTHROPIC_API_KEY=... npm run record:real` re-records the exact same flow against the live model and produces a drop-in replacement cassette, with the test passing unchanged. tapedeck records whatever flows through the middleware, so the cassette mechanics (hashing, replay, drift detection) are identical either way.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm test` | Replay the cassette offline (what CI runs) |
| `npm run record` | Record against the scripted model, no key needed |
| `npm run record:real` | Record against live Anthropic (needs `ANTHROPIC_API_KEY`) |
| `npm run typecheck` | `tsc --noEmit` |

## License

MIT
