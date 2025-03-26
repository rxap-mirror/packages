import { dasherize } from '@rxap/schematics-utilities';
import { buildOperationServerId } from '@rxap/workspace-utilities';

export function buildOperationId(options: {
  project: string,
  feature: string | null,
  shared: boolean
  backend: { project?: string | null, kind?: any, serverId?: string | null } | undefined;
}, operation: string, controller: string): string {
  return `${ dasherize(controller) }-controller-${ dasherize(operation) }@${ buildOperationServerId(options) }`;
}
