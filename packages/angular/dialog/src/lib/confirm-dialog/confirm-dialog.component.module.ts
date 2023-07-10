import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';


@NgModule({
  imports: [
    ConfirmDialogComponent,
  ],
  exports: [ ConfirmDialogComponent ],
  providers: [ ConfirmDialogService ],
})
export class ConfirmDialogComponentModule {
}
