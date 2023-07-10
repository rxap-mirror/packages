import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SignOutDirective } from '@rxap/authentication';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rxap-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: [ './sign-out.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ MatButtonModule, SignOutDirective, MatIconModule ],
})
export class SignOutComponent {

  constructor(
    @Inject(Router)
    private readonly router: Router,
  ) {
  }

  public redirectToRoot() {
    this.router.navigate(['/']);
  }

}
