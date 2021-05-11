import { NgModule } from '@angular/core';
import {
  Routes,
  RouterModule
} from '@angular/router';
import { HasAuthorizationDirectiveComponentModule } from './has-authorization-directive/has-authorization-directive.component.module';
import { HasAuthorizationDirectiveComponent } from './has-authorization-directive/has-authorization-directive.component';

const routes: Routes = [
  {
    path:      'has-authorization-directive',
    component: HasAuthorizationDirectiveComponent
  },
  {
    path:       '**',
    redirectTo: 'has-authorization-directive'
  }
];

@NgModule({
  imports: [
    HasAuthorizationDirectiveComponentModule,
    RouterModule.forChild(routes)
  ]
})
export class FeatureAuthorizationModule {}
