import {
  Inject,
  inject,
  Injectable,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  ProxyRemoteMethod,
  RxapRemoteMethod,
} from '@rxap/remote-method';
import { DashboardAccordionReferenceControllerGetRootParameter } from 'open-api-service-app-angular-accordion/parameters/dashboard-accordion-reference-controller-get-root.parameter';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';

@Injectable()
@RxapRemoteMethod('tree-table-root-proxy')
export class TreeTableRootProxyMethod extends ProxyRemoteMethod<Node<unknown>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter>> {
  protected readonly route = inject(ActivatedRoute);

  constructor(@Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) method: DashboardAccordionReferenceControllerGetRootRemoteMethod) {
    super(method);
  }

  async transformParameters(source: Node<unknown>): Promise<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter>> {
    const { uuid } = this.route.snapshot.params;
    return { parameters: { uuid } };
  }
}
