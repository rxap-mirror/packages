import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GeneralInformationNormalDataGridDataSource } from './general-information-normal-data-grid.data-source';

import { DataGridModule } from '@rxap/data-grid';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'rxap-general-information-normal-data-grid',
  templateUrl: './general-information-normal-data-grid.component.html',
  styleUrls: [ './general-information-normal-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    MatCardModule,
  ],
  providers: [
    
    GeneralInformationNormalDataGridDataSource,
    
  ],
})
export class GeneralInformationNormalDataGridComponent {

  
  constructor(
    public readonly dataGridDataSource: GeneralInformationNormalDataGridDataSource,
  ) {}
  

}
