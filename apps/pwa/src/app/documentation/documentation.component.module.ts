import { NgModule } from '@angular/core';
import { DocumentationComponent } from './documentation.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SantizationModule } from '@rxap/pipes/santization';


@NgModule({
  declarations: [ DocumentationComponent ],
  imports:      [
    MatTabsModule,
    CommonModule,
    SantizationModule
  ],
  exports:      [ DocumentationComponent ]
})
export class DocumentationComponentModule {}
