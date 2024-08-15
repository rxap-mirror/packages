import { dasherize } from '@rxap/schematics-utilities';
import { buildNestProjectName } from '@rxap/workspace-utilities';

export function buildOperationId(options: {
  project: string,
  feature: string | null,
  shared: boolean
  backend: { project?: string | null, kind?: any } | undefined;
}, operation: string, controller: string): string {
  return `${ dasherize(controller) }-controller-${ dasherize(operation) }@${ buildNestProjectName(options) }`;
}
