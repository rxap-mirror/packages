import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SignOutDirective } from '@rxap/authentication';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:        'rxap-sign-out',
  templateUrl:     './sign-out.component.html',
  styleUrls:       [ './sign-out.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-sign-out' },
  standalone:      true,
  imports:         [ MatLegacyButtonModule, SignOutDirective, MatIconModule ]
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
