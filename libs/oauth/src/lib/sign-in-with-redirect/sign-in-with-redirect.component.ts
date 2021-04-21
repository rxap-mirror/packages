import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { OAuthService } from '../o-auth.service';

@Component({
  selector:        'rxap-sign-in-with-redirect',
  templateUrl:     './sign-in-with-redirect.component.html',
  styleUrls:       [ './sign-in-with-redirect.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sign-in-with-redirect' }
})
export class SignInWithRedirectComponent {

  constructor(
    private readonly authService: OAuthService
  ) {}

  public signIn() {
    this.authService.signInWithRedirect();
  }

}
