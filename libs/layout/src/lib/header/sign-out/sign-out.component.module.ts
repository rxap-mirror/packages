import { NgModule } from '@angular/core';
import { SignOutComponent } from './sign-out.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { SignOutDirectiveModule } from '@rxap/authentication';


@NgModule({
  declarations: [SignOutComponent],
  imports: [
    MatButtonModule,
    MatIconModule,
    SignOutDirectiveModule,
  ],
  exports: [SignOutComponent]
})
export class SignOutComponentModule { }
