import {
  Directive,
  HostListener,
  EventEmitter,
  Output,
} from '@angular/core';
import {RxapAuthenticationService} from './authentication.service';

@Directive({
  selector: '[rxapSignOut]',
  standalone: true,
})
export class SignOutDirective {

  @Output()
  public successful = new EventEmitter<void>();

  @Output()
  public failure = new EventEmitter<Error>();

  constructor(private readonly auth: RxapAuthenticationService) {
  }

  @HostListener('click')
  public async onClick() {
    try {
      await this.auth.signOut();
      this.successful.emit();
    } catch (e: any) {
      this.failure.emit(e);
    }
  }

}


