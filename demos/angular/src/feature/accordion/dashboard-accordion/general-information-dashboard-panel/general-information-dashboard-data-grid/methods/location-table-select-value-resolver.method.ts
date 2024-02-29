import { Injectable } from '@angular/core';
import { Method } from '@rxap/pattern';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.remote-method';

@Injectable()
export class LocationTableSelectValueResolverMethod implements Method {
  constructor(private readonly method: DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod) {
  }

  call(parameters?: any): any {
    return this.method.call({ parameters: { ...(parameters.context ?? {}), value: parameters.value } });
  }
}
