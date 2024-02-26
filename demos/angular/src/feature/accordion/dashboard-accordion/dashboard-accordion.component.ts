import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { NavigateBackButtonComponent } from '@rxap/components';
import { IfHasPermissionDirective } from '@rxap/authorization';
import { PersistentAccordionDirective } from '@rxap/material-directives/expansion';
import { GeneralInformationCloudDashboardPanelComponent } from './general-information-cloud-dashboard-panel/general-information-cloud-dashboard-panel.component';
import { GeneralInformationDashboardPanelComponent } from './general-information-dashboard-panel/general-information-dashboard-panel.component';
import { NgSwitch, AsyncPipe, NgIf, NgSwitchDefault } from '@angular/common';
import { LayoutCloudDashboardPanelComponent } from './layout-cloud-dashboard-panel/layout-cloud-dashboard-panel.component';
import { ReferencePanelComponent } from './reference-panel/reference-panel.component';
import { ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { DashboardAccordionDataSource } from './dashboard-accordion.data-source';

@Component({
    standalone: true,
    selector: 'rxap-dashboard-accordion',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-accordion.component.html',
    styleUrls: ['./dashboard-accordion.component.scss'],
  imports: [DataSourceErrorComponent, DataSourceDirective, MatProgressBarModule, MatExpansionModule, MatDividerModule, NavigateBackButtonComponent, IfHasPermissionDirective, PersistentAccordionDirective, GeneralInformationCloudDashboardPanelComponent, GeneralInformationDashboardPanelComponent, NgSwitch, LayoutCloudDashboardPanelComponent, ReferencePanelComponent, AsyncPipe, NgIf, NgSwitchDefault],
  providers: [DashboardAccordionDataSource, {
      provide: ACCORDION_DATA_SOURCE,
      useExisting: DashboardAccordionDataSource
    }],
})
export class DashboardAccordionComponent {
  public readonly accordionDataSource = inject(DashboardAccordionDataSource);
}

export default DashboardAccordionComponent;
