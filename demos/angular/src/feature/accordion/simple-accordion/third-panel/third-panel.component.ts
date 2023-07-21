import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ThirdPanelDataSource } from './third-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule } from '@angular/common';
import { ThirdPanelMethod } from './third-panel.method';

@Component({
  selector: 'rxap-third-panel',
  templateUrl: './third-panel.component.html',
  styleUrls: [ './third-panel.component.scss' ],
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
    ThirdPanelDataSource,
    ThirdPanelMethod,
  ],
})
export class ThirdPanelComponent {

  constructor(
    public readonly panelDataSource: ThirdPanelDataSource,
  ) {}

}
