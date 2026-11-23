import { Directive, output, inject } from '@angular/core';
import { RxapAuthenticationService } from './authentication.service';
import { Showcase } from '@ng-prism/core';

@Showcase<SignOutDirective>({
  title: 'Sign Out',
  category: 'Authentication',
  description: 'Signs the user out when the host element is clicked. The `successful` output emits after the sign out, `failure` emits with the error. The authentication service of the styleguide host does not need a backend.',
  status: 'stable',
  host: '<button type="button">Sign out</button>',
  variants: [
    { name: 'Default' },
  ],
})
@Directive({
  selector: '[rxapSignOut]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class SignOutDirective {
  private readonly auth = inject(RxapAuthenticationService);


  public readonly successful = output<void>();

  public readonly failure = output<Error>();

  public async onClick() {
    try {
      await this.auth.signOut();
      this.successful.emit();
    } catch (e: any) {
      this.failure.emit(e);
    }
  }

}


