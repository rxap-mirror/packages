import { NgModule } from '@angular/core';
import { ConfirmComponent } from './confirm.component';
import { ConfirmDirective } from './confirm.directive';

@NgModule({
  imports: [ ConfirmDirective, ConfirmComponent ], exports: [ ConfirmDirective ],
})
export class ConfirmModule {}
