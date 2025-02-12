import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse } from '../responses/dashboard-accordion-reference-controller-get-scope-type-options.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceController_getScopeTypeOptions',
    operation: '{"operationId":"DashboardAccordionReferenceController_getScopeTypeOptions","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"display":{"type":"string"},"value":{"type":"number"}},"required":["display","value"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference/control/scope-type/options"}'
  })
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsCommand extends OpenApiOperationCommand<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse> {
    return super.execute(parameters);
  }
}
