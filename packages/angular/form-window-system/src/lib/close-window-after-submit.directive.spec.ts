import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormSubmitDirective } from '@rxap/forms';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { Subject } from 'rxjs';
import { CloseWindowAfterSubmitDirective } from './close-window-after-submit.directive';

@Component({
  standalone: true,
  imports: [CloseWindowAfterSubmitDirective],
  template: `<form rxapFormSubmit rxapCloseWindowAfterSubmit></form>`,
})
class HostComponent {}

describe('CloseWindowAfterSubmitDirective', () => {
  const afterSubmit = new Subject<void>();
  const windowRef = { complete: vi.fn() };

  beforeEach(() => {
    windowRef.complete.mockClear();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: RXAP_WINDOW_REF, useValue: windowRef },
        { provide: FormSubmitDirective, useValue: { afterSubmit } },
      ],
    });
  });

  it('completes the window after the form was submitted', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(windowRef.complete).not.toHaveBeenCalled();
    afterSubmit.next();
    expect(windowRef.complete).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes on destroy', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(CloseWindowAfterSubmitDirective))).toBeTruthy();
    fixture.destroy();
    afterSubmit.next();
    expect(windowRef.complete).not.toHaveBeenCalled();
  });
});
