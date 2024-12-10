import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SecondPanelDataSource } from './second-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule, AsyncPipe, JsonPipe } from '@angular/common';
import { SecondPanelMethod } from './second-panel.method';

@Component({
    selector: 'rxap-second-panel',
    templateUrl: './second-panel.component.html',
    styleUrls: ['./second-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DataSourceDirective,
        MatProgressBarModule,
        CommonModule,
        DataSourceErrorComponent,
        AsyncPipe,
        JsonPipe,
    ],
    providers: [SecondPanelDataSource, SecondPanelMethod]
})
export class SecondPanelComponent {

  public readonly panelDataSource = inject(SecondPanelDataSource);
}
