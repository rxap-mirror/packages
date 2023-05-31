import {
  Component,
  Inject
} from '@angular/core';
import { AuthorizationService } from '../authorization.service';
import { AuthorizationDevelopmentService } from './authorization-development.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  NgFor,
  AsyncPipe
} from '@angular/common';
import { MatListModule } from '@angular/material/list';
import {
  CdkOverlayOrigin,
  CdkConnectedOverlay
} from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector:    'rxap-authorization-development-controls',
  templateUrl: './authorization-development-controls.component.html',
  styleUrls:   [ './authorization-development-controls.component.scss' ],
  standalone:  true,
  imports:     [
    MatButtonModule,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    MatListModule,
    NgFor,
    MatSlideToggleModule,
    AsyncPipe
  ]
})
export class AuthorizationDevelopmentControlsComponent {

  public isOpen = false;

  constructor(
    @Inject(AuthorizationService)
    public readonly authorization: AuthorizationDevelopmentService
  ) {
  }

}
