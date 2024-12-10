import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThirdPanelDataSource } from './third-panel.data-source';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { CommonModule, AsyncPipe, JsonPipe } from '@angular/common';
import { ThirdPanelMethod } from './third-panel.method';

@Component({
    selector: 'rxap-third-panel',
    templateUrl: './third-panel.component.html',
    styleUrls: ['./third-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DataSourceDirective,
        MatProgressBarModule,
        CommonModule,
        DataSourceErrorComponent,
        AsyncPipe,
        JsonPipe,
    ],
    providers: [ThirdPanelDataSource, ThirdPanelMethod]
})
export class ThirdPanelComponent {

  public readonly panelDataSource = inject(ThirdPanelDataSource);
}
