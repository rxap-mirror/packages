import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SignOutComponentModule } from './sign-out/sign-out.component.module';
import { UserProfileIconComponentModule } from './user-profile-icon/user-profile-icon.component.module';
import { NavigationProgressBarComponentModule } from './navigation-progress-bar/navigation-progress-bar.component.module';
import { SidenavToggleButtonComponentModule } from './sidenav-toggle-button/sidenav-toggle-button.component.module';
import { ResetButtonComponentModule } from './reset-button/reset-button.component.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [ HeaderComponent ],
  imports: [
    MatToolbarModule,
    SignOutComponentModule,
    UserProfileIconComponentModule,
    NavigationProgressBarComponentModule,
    SidenavToggleButtonComponentModule,
    ResetButtonComponentModule,
    FlexLayoutModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  exports:      [ HeaderComponent ]
})
export class HeaderModule {}
