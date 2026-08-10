import { describe, expect, it } from 'vitest';
import { CassetteMissError } from '@nkwib/tapedeck';
import { withCassette } from '@nkwib/tapedeck/vitest';
import { runSupportAgent, USER_PROMPT } from '../src/agent.js';
import { CASSETTE, cassetteModel } from '../src/model.js';
import { scriptedModel } from '../src/scripted-model.js';

/**
 * Both tests replay the committed cassette: no network, no API key, no env.
 * `withCassette` forces replay mode for its scope, so even if the scripted
 * model had opinions, it is never called; only its provider/modelId identity
 * is used to address the cassette.
 */
describe('order support agent (offline replay)', () => {
  it('calls lookupOrder and answers from the tool result', async () => {
    const model = cassetteModel(scriptedModel());

    const result = await withCassette(CASSETTE, () =>
      runSupportAgent({ model, prompt: USER_PROMPT }),
    );

    expect(result.steps).toHaveLength(2);

    const [toolStep] = result.steps;
    expect(toolStep!.toolCalls).toHaveLength(1);
    expect(toolStep!.toolCalls[0]!.toolName).toBe('lookupOrder');
    expect(toolStep!.toolResults[0]!.output).toMatchObject({
      status: 'shipped',
      carrier: 'DHL',
      eta: '2026-08-14',
    });

    expect(result.text).toContain('A-1001');
    expect(result.text).toContain('DHL');
    expect(result.text).toContain('2026-08-14');
  });

  it('fails loudly when the prompt drifts from the recording', async () => {
    const model = cassetteModel(scriptedModel());

    // A different prompt means a different request hash: replay misses and
    // throws instead of serving stale data. This is what fails CI on drift.
    await expect(
      withCassette(CASSETTE, () =>
        runSupportAgent({ model, prompt: 'Where is my order A-1002?' }),
      ),
    ).rejects.toBeInstanceOf(CassetteMissError);
  });
});
