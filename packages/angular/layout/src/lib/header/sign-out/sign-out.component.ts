import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rxap-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: [ './sign-out.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ MatButtonModule, MatIconModule ],
})
export class SignOutComponent {

  constructor(
    private readonly authenticationService: RxapAuthenticationService,
  ) {
  }

  public async logout() {
    await this.authenticationService.signOut();
  }

}
