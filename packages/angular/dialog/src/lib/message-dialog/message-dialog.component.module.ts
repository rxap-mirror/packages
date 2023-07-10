import { NgModule } from '@angular/core';
import { MessageDialogComponent } from './message-dialog.component';
import { MessageDialogService } from './message-dialog.service';


@NgModule({
  imports: [
    MessageDialogComponent,
  ],
  exports: [
    MessageDialogComponent,
  ],
  providers: [
    MessageDialogService,
  ],
})
export class MessageDialogComponentModule {
}
