import { deepMerge } from '@rxap/utilities';
import {
  IndentationText,
  NewLineKind,
  Project,
  ProjectOptions,
  QuoteKind,
} from 'ts-morph';

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
