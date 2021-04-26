import { CliOptions } from './cli-options';
import { FileVersion } from './file-version';
import { Project } from './project';
import { SchematicOptions } from './schematic-options';

export interface AngularJson {
  $schema?: string;
  version: FileVersion;
  cli?: CliOptions;
  schematics?: SchematicOptions;
  /** Path where new projects will be created. */
  newProjectRoot?: string;
  /** Default project name used in commands. */
  defaultProject?: string;
  projects?: {
      '[key: string]': Project;
    };
}
