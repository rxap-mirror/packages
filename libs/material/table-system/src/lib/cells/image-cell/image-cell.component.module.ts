import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BackgroundImageDirectiveModule } from '@rxap/directives';
import { ImageCellComponent } from './image-cell.component';

@NgModule({
  declarations: [ ImageCellComponent ],
  imports:      [ BackgroundImageDirectiveModule, CommonModule ],
  exports:      [ ImageCellComponent ]
})
export class ImageCellComponentModule {}
