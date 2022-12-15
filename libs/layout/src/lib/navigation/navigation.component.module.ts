import { NgModule } from '@angular/core';
import { NavigationComponent } from './navigation.component';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReplaceRouterPathsPipeModule } from './replace-router-paths.pipe';
import { IconDirectiveModule } from '@rxap/material-directives/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { StopPropagationDirectiveModule } from '@rxap/directives';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


@NgModule({
  declarations: [ NavigationComponent, NavigationItemComponent ],
  imports:      [
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    RouterModule,
    CommonModule,
    IconDirectiveModule,
    MatRippleModule,
    MatDividerModule,
    StopPropagationDirectiveModule,
    MatTooltipModule,
    ReplaceRouterPathsPipeModule
  ],
  exports:      [ NavigationComponent ]
})
export class NavigationComponentModule {}
