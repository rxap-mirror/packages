import { NgModule } from '@angular/core';
import { ContinueComponent } from './continue.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AvatarBackgroundImageDirectiveModule } from '@rxap/directives';


@NgModule({
  declarations: [
    ContinueComponent
  ],
  imports:      [
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    AvatarBackgroundImageDirectiveModule
  ],
  exports:      [
    ContinueComponent
  ]
})
export class ContinueComponentModule {
}
