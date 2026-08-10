import { wrapLanguageModel } from 'ai';
import type { LanguageModel, LanguageModelMiddleware } from 'ai';
import { cassetteMiddleware } from '@nkwib/tapedeck';
import type { CassetteMode } from '@nkwib/tapedeck';

/** One named cassette holds every model call the flow makes. */
export const CASSETTE = 'order-lookup.json';
export const CASSETTE_DIR = './cassettes';

type WrappableModel = Parameters<typeof wrapLanguageModel>[0]['model'];

/**
 * Wrap any model with the tapedeck cassette middleware.
 *
 * The default mode is replay: running anything in this repo without
 * CASSETTE_MODE set never touches the network. `withCassette` (used by the
 * test and the record scripts) overrides mode and cassette name for its scope.
 */
export function cassetteModel(model: WrappableModel): LanguageModel {
  const mode = (process.env.CASSETTE_MODE as CassetteMode | undefined) ?? 'replay';
  return wrapLanguageModel({
    model,
    // tapedeck types its middleware against model spec v3; ai@7 accepts v3
    // middleware at runtime (LanguageModelMiddleware relaxes the spec version),
    // so a single cast bridges the declared types.
    middleware: cassetteMiddleware({
      mode,
      cassetteDir: CASSETTE_DIR,
    }) as unknown as LanguageModelMiddleware,
  });
}
