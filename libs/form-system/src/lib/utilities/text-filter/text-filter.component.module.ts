import { NgModule } from '@angular/core';
import { TextFilterComponent } from './text-filter.component';
import {
  MatInputModule,
  MatIconModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ TextFilterComponent ],
  imports:      [
    MatInputModule,
    MatIconModule,
    FormsModule,
    TranslateModule
  ],
  exports:      [ TextFilterComponent ]
})
export class TextFilterComponentModule {}
