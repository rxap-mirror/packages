import { JsonObject } from '@angular-devkit/core';

export interface LibrarySchematicsBuilderSchema extends JsonObject {
  buildTarget: string;
  tsConfig: string;
}
