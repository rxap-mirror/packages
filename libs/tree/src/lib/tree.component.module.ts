import { NgModule } from '@angular/core';
import { TreeComponent } from './tree.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TreeContentDirective } from './tree-content.directive';
import { PortalModule } from '@angular/cdk/portal';
import { ContenteditableDirectiveModule } from '@rxap/contenteditable';
import { IconDirectiveModule } from '@rxap/material-directives/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';

@NgModule({
  imports:      [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    PortalModule,
    ContenteditableDirectiveModule,
    IconDirectiveModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  declarations: [ TreeComponent, TreeContentDirective ],
  exports:      [ TreeComponent, TreeContentDirective ]
})
export class TreeComponentModule {}
