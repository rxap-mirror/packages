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
  public onClick() {
    this.auth
        .signOut()
        .then(() => this.successful.emit())
        .catch(error => this.failure.emit(error));
  }

}

@NgModule({
  declarations: [ SignOutDirective ],
  exports:      [ SignOutDirective ]
})
export class SignOutDirectiveModule {}
