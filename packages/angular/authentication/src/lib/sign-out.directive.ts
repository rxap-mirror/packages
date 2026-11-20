import { Directive, HostListener, output, inject } from '@angular/core';
import { RxapAuthenticationService } from './authentication.service';

@Directive({
  selector: '[rxapSignOut]',
  standalone: true,
})
export class SignOutDirective {
  private readonly auth = inject(RxapAuthenticationService);


  public readonly successful = output<void>();

  public readonly failure = output<Error>();

  @HostListener('click')
  public async onClick() {
    try {
      await this.auth.signOut();
      // TODO: The 'emit' function requires a mandatory void argument
      this.successful.emit();
    } catch (e: any) {
      this.failure.emit(e);
    }
  }

}


