import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { LayoutCloudDashboardPanelDataSource } from './layout-cloud-dashboard-panel.data-source';

@Component({
    standalone: true,
    selector: 'rxap-layout-cloud-dashboard-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './layout-cloud-dashboard-panel.component.html',
    styleUrls: ['./layout-cloud-dashboard-panel.component.scss'],
  imports: [DataSourceDirective, MatProgressBarModule, DataSourceErrorComponent, AsyncPipe, JsonPipe],
  providers: [LayoutCloudDashboardPanelDataSource],
})
export class LayoutCloudDashboardPanelComponent {
  public readonly panelDataSource = inject(LayoutCloudDashboardPanelDataSource);
}
