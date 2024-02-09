import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavigateBackButtonComponent } from '@rxap/components';
import { DashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-controller-get-by-id.response';

@Component({
  selector: 'rxap-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: [ './accordion-header.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NavigateBackButtonComponent,
  ],
})
export class AccordionHeaderComponent {
  @Input({
    required: true
  })
  public data!: DashboardControllerGetByIdResponse;
}
