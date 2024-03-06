import {
  AsyncPipe,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IfHasPermissionDirective } from '@rxap/authorization';
import { NavigateBackButtonComponent } from '@rxap/components';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { PersistentAccordionDirective } from '@rxap/material-directives/expansion';
import { DashboardAccordionDataSource } from './dashboard-accordion.data-source';
import { GeneralInformationCloudDashboardPanelComponent } from './general-information-cloud-dashboard-panel/general-information-cloud-dashboard-panel.component';
import { GeneralInformationDashboardPanelComponent } from './general-information-dashboard-panel/general-information-dashboard-panel.component';
import { LayoutCloudDashboardPanelComponent } from './layout-cloud-dashboard-panel/layout-cloud-dashboard-panel.component';
import { ReferencePanelComponent } from './reference-panel/reference-panel.component';

@Component({
    standalone: true,
    selector: 'rxap-dashboard-accordion',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-accordion.component.html',
    styleUrls: ['./dashboard-accordion.component.scss'],
  imports: [
    DataSourceErrorComponent, DataSourceDirective, MatProgressBarModule, MatExpansionModule, AsyncPipe, NgIf,
    MatDividerModule, NavigateBackButtonComponent, IfHasPermissionDirective, PersistentAccordionDirective,
    GeneralInformationCloudDashboardPanelComponent, GeneralInformationDashboardPanelComponent, NgSwitch,
    NgSwitchDefault, LayoutCloudDashboardPanelComponent, ReferencePanelComponent, NgSwitchCase,
  ],
  providers: [DashboardAccordionDataSource, {
      provide: ACCORDION_DATA_SOURCE,
      useExisting: DashboardAccordionDataSource
    }],
})
export class DashboardAccordionComponent {
  public readonly accordionDataSource = inject(DashboardAccordionDataSource);
}

export default DashboardAccordionComponent;
