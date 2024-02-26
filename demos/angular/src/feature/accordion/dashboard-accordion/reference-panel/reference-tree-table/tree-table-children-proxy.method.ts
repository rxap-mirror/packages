import { Method } from '@rxap/pattern';
import { Injectable, Inject } from '@angular/core';
import { RxapRemoteMethod, ProxyRemoteMethod } from '@rxap/remote-method';
import { DashboardAccordionReferenceControllerGetChildrenRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-children.remote-method';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionReferenceControllerGetChildrenParameter } from 'open-api-service-app-angular-accordion/parameters/dashboard-accordion-reference-controller-get-children.parameter';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapRemoteMethod('tree-table-children-proxy')
export class TreeTableChildrenProxyMethod extends ProxyRemoteMethod<Node<unknown>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter>> {
  constructor(@Inject(DashboardAccordionReferenceControllerGetChildrenRemoteMethod) method: DashboardAccordionReferenceControllerGetChildrenRemoteMethod, private readonly route: ActivatedRoute) {
    super(method);
  }

  async transformParameters(source: Node<unknown>): Promise<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter>> {
    return source as any
  }
}
