import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector:        'rxap-sign-out',
  templateUrl:     './sign-out.component.html',
  styleUrls:       [ './sign-out.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sign-out' }
})
export class SignOutComponent {

  constructor(
    @Inject(Router)
    private readonly router: Router
  ) {}

  public redirectToRoot() {
    this.router.navigate([ '/' ]);
  }

}
