import { Directive, output, inject } from '@angular/core';
import { RxapAuthenticationService } from './authentication.service';

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


