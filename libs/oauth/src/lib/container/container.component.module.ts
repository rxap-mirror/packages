import { NgModule } from '@angular/core';
import { ContainerComponent } from './container.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ ContainerComponent ],
  imports:      [
    RouterModule
  ],
  exports:      [ ContainerComponent ]
})
export class ContainerComponentModule {}
