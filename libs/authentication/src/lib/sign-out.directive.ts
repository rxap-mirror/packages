import {
  Directive,
  NgModule,
  HostListener,
  EventEmitter,
  Output
} from '@angular/core';
import { RxapAuthenticationService } from './authentication.service';

@Directive({
  selector: '[rxapSignOut]'
})
export class SignOutDirective {

  @Output()
  public successful = new EventEmitter<void>();

  @Output()
  public failure = new EventEmitter<Error>();

  constructor(private readonly auth: RxapAuthenticationService) { }

  @HostListener('click')
  public async onClick() {
    try {
      await this.auth.signOut();
      this.successful.emit();
    } catch (e) {
      this.failure.emit(e);
    }
  }

}

@NgModule({
  declarations: [ SignOutDirective ],
  exports:      [ SignOutDirective ]
})
export class SignOutDirectiveModule {}
