import { TestBed } from '@angular/core/testing';
import { ConfirmComponent } from './confirm.component';

describe('ConfirmComponent', () => {
  it('emits confirmed and unconfirmed from the buttons', () => {
    const fixture = TestBed.createComponent(ConfirmComponent);
    fixture.detectChanges();
    const confirmed = vi.fn();
    const unconfirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.unconfirmed.subscribe(unconfirmed);
    fixture.nativeElement.querySelector('.accept').click();
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(unconfirmed).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('.decline').click();
    expect(unconfirmed).toHaveBeenCalledTimes(1);
  });
});
