import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GeneralInformationNormalDataGridComponent } from './general-information-normal-data-grid/general-information-normal-data-grid.component';

@Component({
  selector: 'rxap-general-information-normal-panel',
  templateUrl: './general-information-normal-panel.component.html',
  styleUrls: [ './general-information-normal-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    GeneralInformationNormalDataGridComponent,
  ],
})
export class GeneralInformationNormalPanelComponent { }
