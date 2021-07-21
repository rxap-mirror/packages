import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  Optional
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
    @Optional()
    @Inject(Router)
    private readonly router: Router | null
  ) {}

  public redirectToRoot() {
    return this.router?.navigate([ '/' ]);
  }

}
