import { Method } from '@rxap/pattern';
import { Injectable, Inject, inject } from '@angular/core';
import { RxapRemoteMethod, ProxyRemoteMethod } from '@rxap/remote-method';
import { DashboardAccordionReferenceControllerGetRootParameter } from 'open-api-service-app-angular-accordion/parameters/dashboard-accordion-reference-controller-get-root.parameter';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ActivatedRoute } from '@angular/router';

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
