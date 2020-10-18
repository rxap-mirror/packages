import { NgModule } from '@angular/core';
import { VersionComponent } from './version.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ VersionComponent ],
  imports: [
    FlexLayoutModule,
    CommonModule
  ],
  exports:      [ VersionComponent ]
})
export class VersionComponentModule {}
