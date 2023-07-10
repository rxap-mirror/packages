import {
  Component,
  Inject,
} from '@angular/core';
import { AuthorizationService } from '../authorization.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  AsyncPipe,
  NgFor,
} from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { AuthorizationDevelopmentService } from '../authorization-development.service';

@Component({
  selector: 'rxap-authorization-development-controls',
  templateUrl: './authorization-development-controls.component.html',
  styleUrls: [ './authorization-development-controls.component.scss' ],
  standalone: true,
  imports: [
    MatButtonModule,
    OverlayModule,
    MatListModule,
    NgFor,
    MatSlideToggleModule,
    AsyncPipe,
  ],
})
export class AuthorizationDevelopmentControlsComponent {

  public isOpen = false;

  constructor(
    @Inject(AuthorizationService)
    public readonly authorization: AuthorizationDevelopmentService,
  ) {
    if (!(
      this.authorization instanceof AuthorizationDevelopmentService
    )) {
      throw new Error(
        'The authorization service must be an instance of AuthorizationDevelopmentService. Ensure that the AuthorizationModule.forRoot({ development: true }) is used.');
    }
  }

}
