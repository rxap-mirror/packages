import { Component, Inject, NgModule } from '@angular/core';
import { AuthorizationService } from '../authorization.service';
import { AuthorizationDevelopmentService } from './authorization-development.service';

@Component({
  selector: 'rxap-authorization-development-controls',
  templateUrl: './authorization-development-controls.component.html',
  styleUrls: ['./authorization-development-controls.component.scss'],
})
export class AuthorizationDevelopmentControlsComponent {

  public isOpen = false;

  constructor(
    @Inject(AuthorizationService)
    public readonly authorization: AuthorizationDevelopmentService
  ) {
  }

}
