import { Method } from '@rxap/pattern';
import { Injectable, Inject } from '@angular/core';
import { RxapRemoteMethod, ProxyRemoteMethod } from '@rxap/remote-method';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapRemoteMethod('tree-table-root-proxy')
export class TreeTableRootProxyMethod extends ProxyRemoteMethod<Node<unknown>, OpenApiRemoteMethodParameter<void>> {
  constructor(@Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) method: DashboardAccordionReferenceControllerGetRootRemoteMethod, private readonly route: ActivatedRoute) {
    super(method);
  }

  async transformParameters(source: Node<unknown>): Promise<OpenApiRemoteMethodParameter<void>> {
    return source as any
  }
}
