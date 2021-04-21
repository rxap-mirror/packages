import { NgModule } from '@angular/core';
import { SignInWithRedirectComponent } from './sign-in-with-redirect.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ SignInWithRedirectComponent ],
  imports:      [
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
    CommonModule
  ],
  exports:      [ SignInWithRedirectComponent ]
})
export class SignInWithRedirectComponentModule {}
