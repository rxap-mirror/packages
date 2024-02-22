import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-controller-get-by-id.response';
import { DashboardAccordionControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-controller-get-by-id.remote-method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';
import { DashboardAccordionControllerGetByIdParameter } from 'open-api-service-app-angular-accordion/parameters/dashboard-accordion-controller-get-by-id.parameter';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { map } from 'rxjs/operators';

@Injectable()
@RxapDataSource('dashboard-accordion')
export class DashboardAccordionDataSource extends AccordionDataSource<DashboardAccordionControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>> {
  protected readonly route = inject(ActivatedRoute);
  protected override readonly method = inject(DashboardAccordionControllerGetByIdRemoteMethod);

  getParameters() {
    return this.route.paramMap.pipe(map(paramMap => {
                const uuid = paramMap.get('uuid');
                if (!uuid) {
                  throw new Error('The route does not contain the parameter uuid');
                }
                return { parameters: { uuid } };
                }));
  }
}
