import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { OAuthService } from '../o-auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector:        'rxap-sign-in-with-redirect',
  templateUrl:     './sign-in-with-redirect.component.html',
  styleUrls:       [ './sign-in-with-redirect.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sign-in-with-redirect' },
  animations:      [
    trigger('fadeAnimation', [

      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(
        ':leave',
        animate(300, style({ opacity: 0 }))
      )
    ])
  ]
})
export class SignInWithRedirectComponent {

  constructor(
    private readonly authService: OAuthService
  ) {}

  public signIn() {
    this.authService.signInWithRedirect();
  }

}
