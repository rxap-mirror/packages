import {
  Component,
  Inject
} from '@angular/core';
import { AuthorizationService } from '../authorization.service';
import { AuthorizationDevelopmentService } from './authorization-development.service';
import { MatLegacySlideToggleModule } from '@angular/material/legacy-slide-toggle';
import {
  NgFor,
  AsyncPipe
} from '@angular/common';
import { MatLegacyListModule } from '@angular/material/legacy-list';
import {
  CdkOverlayOrigin,
  CdkConnectedOverlay
} from '@angular/cdk/overlay';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:    'rxap-authorization-development-controls',
  templateUrl: './authorization-development-controls.component.html',
  styleUrls:   [ './authorization-development-controls.component.scss' ],
  standalone:  true,
  imports:     [
    MatLegacyButtonModule,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    MatLegacyListModule,
    NgFor,
    MatLegacySlideToggleModule,
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
