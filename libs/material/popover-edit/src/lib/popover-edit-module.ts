/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import {
  MatPopoverEdit,
  MatPopoverEditTabOut,
  MatRowHoverContent,
  MatEditOpen
} from './table-directives';
import {
  MatEditLens,
  MatEditRevert,
  MatEditClose
} from './lens-directives';
import { CdkPopoverEditModule } from './cdk/popover-edit-module';
import { CdkEditable } from './cdk/table-directives';

@NgModule({
  imports: [
    CdkPopoverEditModule,
    MatCommonModule,
    MatPopoverEdit,
    MatPopoverEditTabOut,
    MatRowHoverContent,
    MatEditLens,
    MatEditRevert,
    MatEditClose,
    MatEditOpen
  ],
  exports: [
    MatPopoverEdit,
    MatPopoverEditTabOut,
    MatRowHoverContent,
    MatEditLens,
    MatEditRevert,
    MatEditClose,
    MatEditOpen,
    CdkEditable
  ]
})
export class MatPopoverEditModule {}
