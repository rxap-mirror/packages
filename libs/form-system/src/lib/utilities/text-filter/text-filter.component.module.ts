import { NgModule } from '@angular/core';
import { TextFilterComponent } from './text-filter.component';
import {
  MatInputModule,
  MatIconModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ TextFilterComponent ],
  imports:      [
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  exports:      [ TextFilterComponent ]
})
export class TextFilterComponentModule {}
