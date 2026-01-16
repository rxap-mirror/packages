import { TableActionKind } from '@rxap/schematic-angular';
import { NormalizeOpenApiTableActionOptions } from './normalize-open-api-table-action-options';
import { OpenApiTableActionOptions } from './schema';

describe('NormalizeOpenApiTableActionOptions', () => {
  it('should normalize minimal open-api table action options', () => {
    const options: OpenApiTableActionOptions = {
      name: 'api-call',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.OPEN_API,
      operationId: 'myOp',
      type: 'edit',
    };
    expect(NormalizeOpenApiTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex open-api table action options', () => {
    const options: OpenApiTableActionOptions = {
      name: 'update',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.OPEN_API,
      icon: 'update',
      type: 'edit',
      operationId: 'UserController_update',
      body: { id: 'uuid' },
      parameters: { force: 'true' },
    };
    expect(NormalizeOpenApiTableActionOptions(options)).toMatchSnapshot();
  });
});
