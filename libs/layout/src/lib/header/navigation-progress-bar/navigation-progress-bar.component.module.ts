import { NgModule } from '@angular/core';
import { NavigationProgressBarComponent } from './navigation-progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [NavigationProgressBarComponent],
  imports: [
    MatProgressBarModule,
    CommonModule
  ],
  exports: [NavigationProgressBarComponent]
})
export class NavigationProgressBarComponentModule { }
