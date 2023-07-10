import {CliOptions} from './cli-options';
import {FileVersion} from './file-version';
import {Project} from './project';

export interface AngularJson {
  $schema?: string;
  version: FileVersion;
  cli?: CliOptions;
  schematics?: Record<string, Record<string, any>>;
  /** Path where new projects will be created. */
  newProjectRoot?: string;
  /** Default project name used in commands. */
  defaultProject?: string;
  projects?: Record<string, Project>;
}
