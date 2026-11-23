import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AutoFormFieldHeightBottomContainerDirective } from './auto-form-field-height-bottom-container.directive';
import { FormFieldNoPaddingDirective } from './form-field-no-padding.directive';

@Component({
  imports: [MatFormFieldModule, MatInputModule, AutoFormFieldHeightBottomContainerDirective, FormFieldNoPaddingDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<mat-form-field id="ff" rxapAutoHeightBottomContainer rxapNoPadding><input matInput /></mat-form-field>`,
})
class HostComponent {}

describe('form-field directives', () => {
  it('adds the no padding class', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#ff').classList.contains('rxap-form-field-no-padding')).toBe(true);
  });

  it('sets the bottom container height from the observed height', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const el = f.nativeElement.querySelector('#ff') as HTMLElement;
    const bottom = el.querySelector('.mat-mdc-form-field-bottom-align') as HTMLElement;
    expect(bottom).not.toBeNull();
    // the real ObserveElementHeight (MutationObserver based) is used: no error wrapper -> auto
    expect(bottom.style.height).toBe('auto');

    const wrapper = document.createElement('div');
    wrapper.className = 'mat-mdc-form-field-error-wrapper';
    Object.defineProperty(wrapper, 'clientHeight', { configurable: true, value: 24 });
    el.appendChild(wrapper);
    await new Promise((resolve) => setTimeout(resolve));
    expect(bottom.style.height).toBe('24px');

    wrapper.remove();
    await new Promise((resolve) => setTimeout(resolve));
    expect(bottom.style.height).toBe('auto');
  });
});
