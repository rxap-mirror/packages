import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FirstPanelDataSource } from './first-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule } from '@angular/common';
import { FirstPanelMethod } from './first-panel.method';

@Component({
  selector: 'rxap-first-panel',
  templateUrl: './first-panel.component.html',
  styleUrls: [ './first-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataSourceDirective,
    MatProgressBarModule,
    FlexLayoutModule,
    CommonModule,
    DataSourceErrorComponent,
  ],
  standalone: true,
  providers: [
    FirstPanelDataSource,
    FirstPanelMethod,
  ],
})
export class FirstPanelComponent {

  constructor(
    public readonly panelDataSource: FirstPanelDataSource,
  ) {}

}
