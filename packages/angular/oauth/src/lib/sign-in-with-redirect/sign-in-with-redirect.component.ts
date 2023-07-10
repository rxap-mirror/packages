import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { OAuthService } from '../o-auth.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'rxap-sign-in-with-redirect',
  templateUrl: './sign-in-with-redirect.component.html',
  styleUrls: [ './sign-in-with-redirect.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'rxap-sign-in-with-redirect' },
  animations: [
    trigger('fadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),
      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300),
      ]),
      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(300, style({ opacity: 0 }))),
    ]),
  ],
  standalone: true,
  imports: [ FlexModule, MatIconModule, MatButtonModule ],
})
export class SignInWithRedirectComponent {

  constructor(
    private readonly authService: OAuthService,
  ) {
  }

  public signIn() {
    this.authService.signInWithRedirect();
  }

}
