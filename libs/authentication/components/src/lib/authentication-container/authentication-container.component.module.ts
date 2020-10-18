import { NgModule } from '@angular/core';
import { AuthenticationContainerComponent } from './authentication-container.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [ AuthenticationContainerComponent ],
  exports:      [ AuthenticationContainerComponent ],
  imports:      [
    FlexLayoutModule,
    MatToolbarModule,
    RouterModule
  ]
})
export class AuthenticationContainerComponentModule {}
