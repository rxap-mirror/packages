import { deepMerge } from '@rxap/utilities';
import {
  IndentationText,
  NewLineKind,
  Project,
  ProjectOptions,
  QuoteKind,
} from 'ts-morph';

/**
 * Creates a new ts-morph Project with default settings for Angular/RxAP development.
 *
 * @param options - Optional project options to override defaults.
 * @returns A new ts-morph Project instance.
 */
export function CreateProject(options: ProjectOptions = {}) {
  return new Project(deepMerge({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
      newLineKind: NewLineKind.LineFeed,
      useTrailingCommas: true,
    },
    useInMemoryFileSystem: true,
  }, options));
}
