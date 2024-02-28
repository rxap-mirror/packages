import {
  Inject,
  Injectable,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Node } from '@rxap/data-structure-tree';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  ProxyRemoteMethod,
  RxapRemoteMethod,
} from '@rxap/remote-method';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';

@Injectable()
@RxapRemoteMethod('tree-table-root-proxy')
export class TreeTableRootProxyMethod extends ProxyRemoteMethod<Node<unknown>, OpenApiRemoteMethodParameter<void>> {
  constructor(@Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) method: DashboardAccordionReferenceControllerGetRootRemoteMethod, private readonly route: ActivatedRoute) {
    super(method);
  }

  async transformParameters(source: Node<unknown>): Promise<OpenApiRemoteMethodParameter<void>> {
    return source as any;
  }
}
