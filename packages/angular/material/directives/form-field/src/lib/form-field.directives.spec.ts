import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AutoFormFieldHeightBottomContainerDirective } from './auto-form-field-height-bottom-container.directive';
import { FormFieldNoPaddingDirective } from './form-field-no-padding.directive';

const observe = jest.fn();
jest.mock('@rxap/browser-utilities', () => ({
  ObserveElementHeight: (...a: unknown[]) => observe(...a),
}));

@Component({
  imports: [MatFormFieldModule, MatInputModule, AutoFormFieldHeightBottomContainerDirective, FormFieldNoPaddingDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<mat-form-field id="ff" rxapAutoHeightBottomContainer rxapNoPadding><input matInput /></mat-form-field>`,
})
class HostComponent {}

describe('form-field directives', () => {
  it('adds the no padding class', () => {
    observe.mockReturnValue({ pipe: () => ({ subscribe: () => undefined }) });
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#ff').classList.contains('rxap-form-field-no-padding')).toBe(true);
  });

  it('sets the bottom container height from the observed height', () => {
    const { Subject } = jest.requireActual('rxjs');
    const height$ = new Subject();
    observe.mockReturnValue(height$);
    jest.spyOn(console, 'log').mockImplementation();
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const el = f.nativeElement.querySelector('#ff') as HTMLElement;
    const bottom = el.querySelector('.mat-mdc-form-field-bottom-align') as HTMLElement;
    expect(bottom).not.toBeNull();
    height$.next(24);
    expect(bottom.style.height).toBe('24px');
    height$.next(null);
    expect(bottom.style.height).toBe('auto');
    expect(observe).toHaveBeenCalledWith(el, '.mat-mdc-form-field-error-wrapper');
  });
});
