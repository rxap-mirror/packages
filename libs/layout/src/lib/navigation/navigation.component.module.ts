import { NgModule } from '@angular/core';
import { NavigationComponent } from './navigation.component';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReplaceRouterPathsPipe } from './replace-router-paths.pipe';
import { IconDirectiveModule } from '@rxap/material-directives/icon';
import { ButtonComponentModule } from '@rxap/components';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { StopPropagationDirectiveModule } from '@rxap/directives';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [ NavigationComponent, NavigationItemComponent, ReplaceRouterPathsPipe ],
  imports: [
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    RouterModule,
    CommonModule,
    IconDirectiveModule,
    ButtonComponentModule,
    MatRippleModule,
    MatDividerModule,
    StopPropagationDirectiveModule,
    MatTooltipModule
  ],
  exports:      [ NavigationComponent ]
})
export class NavigationComponentModule {}
