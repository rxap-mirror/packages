import { NgModule } from '@angular/core';
import { HasAuthorizationDirectiveComponent } from './has-authorization-directive.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { HasAuthorizationDirectiveModule } from '@rxap/authorization';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  JsonViewerModule,
  CopyToClipboardModule
} from '@rxap/components';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [ HasAuthorizationDirectiveComponent ],
  imports:      [
    FlexLayoutModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
    HasAuthorizationDirectiveModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    JsonViewerModule,
    RxapFormsModule,
    ReactiveFormsModule,
    CopyToClipboardModule,
    MatExpansionModule
  ],
  exports:      [ HasAuthorizationDirectiveComponent ]
})
export class HasAuthorizationDirectiveComponentModule {}
