import { NgModule } from '@angular/core';
import { UserProfileIconComponent } from './user-profile-icon.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AvatarBackgroundImageDirectiveModule } from '@rxap/directives';


@NgModule({
  declarations: [UserProfileIconComponent],
  imports: [
    MatMenuModule,
    MatIconModule,
    CommonModule,
    FlexLayoutModule,
    AvatarBackgroundImageDirectiveModule,
  ],
  exports: [UserProfileIconComponent]
})
export class UserProfileIconComponentModule { }
