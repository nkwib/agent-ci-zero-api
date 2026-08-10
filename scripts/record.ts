/**
 * Record the cassette against the scripted model: no API key, no network.
 *
 * `withCassette` in record mode starts the named cassette fresh and captures
 * every model call the agent makes (two here: tool call, then final answer).
 */
import { withCassette } from '@nkwib/tapedeck/vitest';
import { runSupportAgent, USER_PROMPT } from '../src/agent.js';
import { CASSETTE, CASSETTE_DIR, cassetteModel } from '../src/model.js';
import { scriptedModel } from '../src/scripted-model.js';

const model = cassetteModel(scriptedModel());

const result = await withCassette(
  CASSETTE,
  () => runSupportAgent({ model, prompt: USER_PROMPT }),
  { mode: 'record' },
);

console.log(`Recorded ${CASSETTE_DIR}/${CASSETTE} (${result.steps.length} steps)`);
console.log(`Final answer: ${result.text}`);
