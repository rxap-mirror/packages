import { NgModule } from '@angular/core';
import { CopyToClipboardCellComponent } from './copy-to-clipboard-cell.component';
import { CopyToClipboardModule } from '@rxap/components';



@NgModule({
  declarations: [CopyToClipboardCellComponent],
  imports: [
    CopyToClipboardModule,
  ],
  exports: [CopyToClipboardCellComponent]
})
export class CopyToClipboardCellComponentModule { }
