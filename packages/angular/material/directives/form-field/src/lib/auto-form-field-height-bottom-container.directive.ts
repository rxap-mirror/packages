import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
} from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ObserveElementHeight } from '@rxap/browser-utilities';
import { log } from '@rxap/rxjs';
import {
  distinctUntilChanged,
  tap,
} from 'rxjs';

@Directive({
  selector: 'mat-form-field[rxapAutoHeightBottomContainer]',
  standalone: true,
})
export class AutoFormFieldHeightBottomContainerDirective implements AfterViewInit {

  public element = inject(ElementRef);

  ngAfterViewInit() {
    ObserveElementHeight(this.element.nativeElement, '.mat-mdc-form-field-error-wrapper').pipe(
      distinctUntilChanged(),
      log('height change'),
      tap(height => {
        if (height) {
          this.element.nativeElement.querySelector('.mat-mdc-form-field-bottom-align').style.height = `${ height }px`;
        } else {
          this.element.nativeElement.querySelector('.mat-mdc-form-field-bottom-align').style.height = 'auto';
        }
      }),
    ).subscribe();
  }

}
