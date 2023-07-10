import { CliOptions } from './cli-options';
import { I18n } from './i18n';
import { SchematicOptions } from './schematic-options';
import { Target } from './target';

export interface Project {
  cli?: CliOptions;
  schematics?: SchematicOptions;
  /** The prefix to apply to generated selectors. */
  prefix?: string;
  /** Root of the project files. */
  root: string;
  i18n?: I18n;
  /** The root of the source files, assets and index.html file structure. */
  sourceRoot?: string;
  /** Project type. */
  projectType: 'application' | 'library';
  architect?: Record<string, Target>;
  targets?: Record<string, Target>;
}
