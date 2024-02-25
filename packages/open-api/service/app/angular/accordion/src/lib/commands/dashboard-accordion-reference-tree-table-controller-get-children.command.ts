import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-children.response';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-children.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceTreeTableController_getChildren',
    operation: '{"operationId":"DashboardAccordionReferenceTreeTableController_getChildren","parameters":[{"name":"parentUuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"referenced":{"type":"boolean"},"name":{"type":"string"},"type":{"type":"string"},"hasChildren":{"type":"boolean"},"children":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionReferenceTreeTableItemDto"}}},"required":["referenced","name","type","hasChildren"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference-tree-table/{parentUuid}"}'
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenCommand extends OpenApiOperationCommand<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>): Promise<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse> {
    return super.execute(parameters);
  }
}
