import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GeneralInformationDataGridComponent } from './general-information-data-grid/general-information-data-grid.component';

@Component({
  selector: 'rxap-general-information-panel',
  templateUrl: './general-information-panel.component.html',
  styleUrls: [ './general-information-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    GeneralInformationDataGridComponent,
  ],
})
export class GeneralInformationPanelComponent { }
