import {
  ApplicationRef,
  Component,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ErrorCaptureDialogService } from './error-capture-dialog.service';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import {
  RXAP_ERROR_DIALOG_DISABLED,
  RXAP_ERROR_DIALOG_ERROR,
} from './tokens';
import { inject } from '@angular/core';

@Component({ selector: 'rxap-test-err', template: '<span class="err">{{ error.message }}</span>' })
class TestErrorComponent {
  error = inject(RXAP_ERROR_DIALOG_ERROR);
}

describe('ErrorCaptureDialogService', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal ??= vi.fn();
    HTMLDialogElement.prototype.close ??= vi.fn();
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('returns EMPTY and logs when disabled', () => {
    TestBed.configureTestingModule({ providers: [{ provide: RXAP_ERROR_DIALOG_DISABLED, useValue: true }] });
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const next = vi.fn();
    const complete = vi.fn();
    TestBed.inject(ErrorCaptureDialogService).open(TestErrorComponent, signal([])).subscribe({ next, complete });
    expect(complete).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
  });

  it('renders the dialog, and removes it on close', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ErrorCaptureDialogService);
    const appRef = TestBed.inject(ApplicationRef);
    const next = vi.fn();
    const sub = service.open(TestErrorComponent, signal([{ message: 'oops' }])).subscribe(next);
    await appRef.whenStable();
    expect(document.body.querySelectorAll('dialog').length).toBe(1);
    expect(document.body.querySelector('.err')?.textContent).toBe('oops');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    const close = Array.from(document.body.querySelectorAll('dialog > button')).pop() as HTMLButtonElement;
    close.click();
    expect(next).toHaveBeenCalledTimes(1);
    expect(document.body.querySelectorAll('dialog').length).toBe(0);
    sub.unsubscribe();
  });

  it('exports ErrorDialogComponent used by the service', () => {
    expect(ErrorDialogComponent).toBeDefined();
  });
});
