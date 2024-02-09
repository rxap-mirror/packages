import { Method } from '@rxap/pattern';
import { Injectable, Inject } from '@angular/core';
import { RxapRemoteMethod, ProxyRemoteMethod } from '@rxap/remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-tree-table-controller-get-root.remote-method';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetRootParameter } from 'open-api-service-app-angular-accordion/parameters/dashboard-accordion-reference-tree-table-controller-get-root.parameter';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapRemoteMethod('tree-table-root-proxy')
export class TreeTableRootProxyMethod extends ProxyRemoteMethod<Node<unknown>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetRootParameter>> {
  constructor(@Inject(DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod) method: DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod, private readonly route: ActivatedRoute) {
    super(method);
  }

  async transformParameters(source: Node<unknown>): Promise<OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetRootParameter>> {
    return source as any
  }
}
