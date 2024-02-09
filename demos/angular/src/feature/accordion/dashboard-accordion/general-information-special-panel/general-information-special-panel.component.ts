import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GeneralInformationSpecialDataGridComponent } from './general-information-special-data-grid/general-information-special-data-grid.component';

@Component({
  selector: 'rxap-general-information-special-panel',
  templateUrl: './general-information-special-panel.component.html',
  styleUrls: [ './general-information-special-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    GeneralInformationSpecialDataGridComponent,
  ],
})
export class GeneralInformationSpecialPanelComponent { }
