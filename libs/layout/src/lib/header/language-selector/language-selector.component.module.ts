import { NgModule } from '@angular/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ LanguageSelectorComponent ],
  imports:      [
    MatSelectModule,
    CommonModule,
    FormsModule
  ],
  exports:      [ LanguageSelectorComponent ]
})
export class LanguageSelectorComponentModule {}
