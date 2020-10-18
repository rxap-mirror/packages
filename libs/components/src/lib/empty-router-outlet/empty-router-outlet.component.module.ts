import { NgModule } from '@angular/core';
import { EmptyRouterOutletComponent } from './empty-router-outlet.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ EmptyRouterOutletComponent ],
  imports:      [
    RouterModule
  ],
  exports:      [ EmptyRouterOutletComponent ]
})
export class EmptyRouterOutletModule {}
