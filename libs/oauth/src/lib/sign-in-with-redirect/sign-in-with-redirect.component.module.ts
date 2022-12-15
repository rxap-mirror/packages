import { NgModule } from '@angular/core';
import { SignInWithRedirectComponent } from './sign-in-with-redirect.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


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
