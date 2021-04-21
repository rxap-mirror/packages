import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  map,
  take
} from 'rxjs/operators';
import { OAuthSingleSignOnService } from '../o-auth-single-sign-on.service';
import { RXAP_O_AUTH_REDIRECT_LOGIN } from '@rxap/oauth';

@Component({
  selector:        'rxap-continue',
  templateUrl:     './continue.component.html',
  styleUrls:       [ './continue.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-continue' },
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
export class ContinueComponent<Profile = any> implements OnInit {

  public profile!: Promise<Profile>;

  constructor(
    @Inject(ActivatedRoute)
    private readonly route: ActivatedRoute,
    @Inject(Router)
    private readonly router: Router,
    @Inject(OAuthSingleSignOnService)
    private readonly oAuthService: OAuthSingleSignOnService,
    @Inject(RXAP_O_AUTH_REDIRECT_LOGIN)
    private readonly redirectLogin: string[]
  ) {
  }

  public ngOnInit() {
    this.profile = this.route.data.pipe(take(1), map(data => data.profile)).toPromise();
  }

  signOut() {
    this.oAuthService.signOut();
    return this.router.navigate(this.redirectLogin);
  }

  redirect() {
    this.oAuthService.redirectToClient();
  }
}
