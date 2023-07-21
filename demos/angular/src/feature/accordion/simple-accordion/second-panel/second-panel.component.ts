import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { SecondPanelDataSource } from './second-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule } from '@angular/common';
import { SecondPanelMethod } from './second-panel.method';

@Component({
  selector: 'rxap-second-panel',
  templateUrl: './second-panel.component.html',
  styleUrls: [ './second-panel.component.scss' ],
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
    SecondPanelDataSource,
    SecondPanelMethod,
  ],
})
export class SecondPanelComponent {

  constructor(
    public readonly panelDataSource: SecondPanelDataSource,
  ) {}

}
