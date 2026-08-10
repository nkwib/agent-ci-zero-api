import { MockLanguageModelV4 } from 'ai/test';

/**
 * Model identity the cassette is keyed on. The scripted mock impersonates the
 * exact identity `scripts/record-real.ts` uses, so a cassette recorded against
 * the live model is a drop-in replacement for the committed one: the test does
 * not change either way.
 */
export const MODEL_PROVIDER = 'anthropic.messages';
export const MODEL_ID = 'claude-haiku-4-5';

const usage = (input: number, output: number) => ({
  inputTokens: { total: input, noCache: input, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: output, text: output, reasoning: 0 },
});

/**
 * A scripted model for recording without an API key. Turn 1 calls the
 * lookupOrder tool, turn 2 answers from the tool result. tapedeck records
 * whatever flows through the middleware, so the cassette this produces is
 * mechanically identical to one recorded against the live API.
 */
export function scriptedModel() {
  return new MockLanguageModelV4({
    provider: MODEL_PROVIDER,
    modelId: MODEL_ID,
    doGenerate: [
      {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'toolu_01demo0000000000000001',
            toolName: 'lookupOrder',
            input: JSON.stringify({ orderId: 'A-1001' }),
          },
        ],
        finishReason: { unified: 'tool-calls', raw: 'tool_use' },
        usage: usage(214, 43),
        warnings: [],
      },
      {
        content: [
          {
            type: 'text',
            text: 'Your order A-1001 has shipped with DHL and is expected to arrive on 2026-08-14.',
          },
        ],
        finishReason: { unified: 'stop', raw: 'end_turn' },
        usage: usage(281, 27),
        warnings: [],
      },
    ],
  });
}
