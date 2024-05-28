import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FirstPanelDataSource } from './first-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule, AsyncPipe, JsonPipe } from '@angular/common';
import { FirstPanelMethod } from './first-panel.method';

@Component({
  selector: 'rxap-first-panel',
  templateUrl: './first-panel.component.html',
  styleUrls: ['./first-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataSourceDirective,
    MatProgressBarModule,
    CommonModule,
    DataSourceErrorComponent,
    AsyncPipe,
    JsonPipe,
  ],
  standalone: true,
  providers: [FirstPanelDataSource, FirstPanelMethod],
})
export class FirstPanelComponent {

  public readonly panelDataSource = inject(FirstPanelDataSource);
}
