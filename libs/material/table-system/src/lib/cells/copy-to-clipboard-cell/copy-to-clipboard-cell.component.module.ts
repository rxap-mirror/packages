import { NgModule } from '@angular/core';
import { CopyToClipboardCellComponent } from './copy-to-clipboard-cell.component';
import { CopyToClipboardModule } from '@rxap/components';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [CopyToClipboardCellComponent],
  imports: [
    CopyToClipboardModule,
    CommonModule
  ],
  exports: [CopyToClipboardCellComponent]
})
export class CopyToClipboardCellComponentModule { }
