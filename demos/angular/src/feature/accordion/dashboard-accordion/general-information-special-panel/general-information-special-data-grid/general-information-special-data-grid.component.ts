import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormProviders, FormComponentProviders } from './form.providers';

import { GeneralInformationSpecialDataGridDataSource } from './general-information-special-data-grid.data-source';

import { DataGridModule } from '@rxap/data-grid';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'rxap-general-information-special-data-grid',
  templateUrl: './general-information-special-data-grid.component.html',
  styleUrls: [ './general-information-special-data-grid.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    RxapFormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
  ],
  providers: [
    
    GeneralInformationSpecialDataGridDataSource,
    
    FormProviders,
    FormComponentProviders,
  ],
})
export class GeneralInformationSpecialDataGridComponent {

  
  constructor(
    public readonly dataGridDataSource: GeneralInformationSpecialDataGridDataSource,
  ) {}
  

}
