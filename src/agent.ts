import { generateText, stepCountIs, tool } from 'ai';
import type { LanguageModel } from 'ai';
import { z } from 'zod';

/**
 * Canned order database. The tool is deterministic on purpose: tool results
 * feed back into the second model call, so they are part of the request hash
 * tapedeck uses to address the cassette.
 */
const ORDERS = new Map<string, { status: string; carrier: string; eta: string }>([
  ['A-1001', { status: 'shipped', carrier: 'DHL', eta: '2026-08-14' }],
  ['A-1002', { status: 'processing', carrier: 'none', eta: 'unknown' }],
]);

export const INSTRUCTIONS =
  'You are a terse order-support agent. Use the lookupOrder tool to fetch the order status, then answer the customer in one sentence.';

/** The exact user prompt the committed cassette was recorded with. */
export const USER_PROMPT = 'Where is my order A-1001?';

/**
 * The agent under test. The model is injected so the record scripts and the
 * replay test run the exact same code path: same instructions, same tool
 * schema, same sampling params. Anything that diverges changes the request
 * hash and fails replay.
 */
export function runSupportAgent({ model, prompt }: { model: LanguageModel; prompt: string }) {
  return generateText({
    model,
    instructions: INSTRUCTIONS,
    prompt,
    tools: {
      lookupOrder: tool({
        description: 'Look up the current status of an order by its id.',
        inputSchema: z.object({
          orderId: z.string().describe('The order id, e.g. A-1001'),
        }),
        execute: async ({ orderId }) =>
          ORDERS.get(orderId) ?? { status: 'not_found', carrier: 'none', eta: 'unknown' },
      }),
    },
    stopWhen: stepCountIs(3),
    temperature: 0,
    maxRetries: 0,
  });
}
