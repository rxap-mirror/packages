import { JsonObject } from '@angular-devkit/core';

export interface AppEngineDeployBuilderSchema extends JsonObject {
  skipBuild?: boolean;
  promote?: boolean;
  noPromote?: boolean;
  stopPreviousVersion?: boolean;
  version?: string;
  project?: string;
}
