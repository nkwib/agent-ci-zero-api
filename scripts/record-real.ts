/**
 * Re-record the same flow against the live Anthropic API:
 *
 *   ANTHROPIC_API_KEY=sk-... npm run record:real
 *
 * The scripted mock impersonates this exact model identity
 * (anthropic.messages / claude-haiku-4-5), so the resulting cassette is a
 * drop-in replacement for the committed one and the test passes unchanged.
 */
import { anthropic } from '@ai-sdk/anthropic';
import { withCassette } from '@nkwib/tapedeck/vitest';
import { runSupportAgent, USER_PROMPT } from '../src/agent.js';
import { CASSETTE, CASSETTE_DIR, cassetteModel } from '../src/model.js';
import { MODEL_ID } from '../src/scripted-model.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is required to record against the live API.');
  console.error('Without a key, use `npm run record` (scripted model, offline).');
  process.exit(1);
}

const model = cassetteModel(anthropic(MODEL_ID));

const result = await withCassette(
  CASSETTE,
  () => runSupportAgent({ model, prompt: USER_PROMPT }),
  { mode: 'record' },
);

console.log(`Recorded ${CASSETTE_DIR}/${CASSETTE} (${result.steps.length} steps, live API)`);
console.log(`Final answer: ${result.text}`);
