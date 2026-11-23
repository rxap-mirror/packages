import { Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmClick } from './confirm-click';

const executeSpy = vi.fn();

@Directive({ selector: '[rxapTestConfirmClick]', standalone: true })
class TestConfirmClickDirective extends ConfirmClick {
  protected execute(): void {
    executeSpy();
  }
}

@Component({
  standalone: true,
  imports: [ TestConfirmClickDirective ],
  template: `
    <button id="plain" rxapTestConfirmClick>plain</button>
    <button id="confirm" rxapTestConfirmClick rxapConfirm>confirm</button>
    <button id="disabled" rxapTestConfirmClick [rxapConfirm]="false">disabled</button>
  `,
})
class HostComponent {}

describe('@rxap/directives', () => {
  describe('ConfirmClick', () => {
    beforeEach(() => executeSpy.mockClear());

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const button = (id: string) => fixture.debugElement.query(By.css(`#${ id }`));
      return { fixture, button };
    }

    it('should execute on click without a confirm directive', () => {
      const { button } = setup();
      button('plain').nativeElement.click();
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not execute on click when the confirm directive is present', () => {
      const { button } = setup();
      button('confirm').nativeElement.click();
      expect(executeSpy).not.toHaveBeenCalled();
    });

    it('should execute on click when the confirm attribute is explicitly false', () => {
      const { button } = setup();
      button('disabled').nativeElement.click();
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should execute when the confirmed event is emitted', () => {
      const { button } = setup();
      button('confirm').triggerEventHandler('confirmed', undefined);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
