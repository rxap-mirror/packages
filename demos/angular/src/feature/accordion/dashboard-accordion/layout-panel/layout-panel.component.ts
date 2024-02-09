import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutPanelDataSource } from './layout-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'rxap-layout-panel',
  templateUrl: './layout-panel.component.html',
  styleUrls: [ './layout-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataSourceDirective,
    MatProgressBarModule,
    CommonModule,
    DataSourceErrorComponent,
  ],
  standalone: true,
  providers: [
    LayoutPanelDataSource,
  ],
})
export class LayoutPanelComponent {

  constructor(
    public readonly panelDataSource: LayoutPanelDataSource,
  ) {}

}
