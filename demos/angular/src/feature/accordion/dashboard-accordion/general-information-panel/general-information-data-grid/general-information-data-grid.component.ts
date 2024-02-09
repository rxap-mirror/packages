import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormProviders, FormComponentProviders } from './form.providers';

import { GeneralInformationDataGridDataSource } from './general-information-data-grid.data-source';

import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'rxap-general-information-data-grid',
  templateUrl: './general-information-data-grid.component.html',
  styleUrls: [ './general-information-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    RxapFormsModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  providers: [
    
    GeneralInformationDataGridDataSource,
    
    FormProviders,
    FormComponentProviders,
  ],
})
export class GeneralInformationDataGridComponent {

  
  constructor(
    public readonly dataGridDataSource: GeneralInformationDataGridDataSource,
  ) {}
  

}
