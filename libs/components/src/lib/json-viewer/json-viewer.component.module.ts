import { NgModule } from '@angular/core';
import { JsonViewerComponent } from './json-viewer.component';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ JsonViewerComponent ],
  imports:      [
    CommonModule
  ],
  exports:      [ JsonViewerComponent ]
})
export class JsonViewerModule {}
