import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NavigateBackButtonComponent } from '@rxap/components';
import { DashboardAccordionControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-controller-get-by-id.response';

@Component({
    standalone: true,
    selector: 'rxap-accordion-header',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './accordion-header.component.html',
    styleUrls: ['./accordion-header.component.scss'],
  imports: [NavigateBackButtonComponent],
})
export class AccordionHeaderComponent {
  @Input({
      required: true
    })
  public data!: DashboardAccordionControllerGetByIdResponse;
}
