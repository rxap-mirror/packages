import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FullWidthDirective } from './full-width.directive';
import { PreventDefaultDirective } from './prevent-default.directive';
import { StopImmediatePropagationDirective } from './stop-immediate-propagation.directive';
import { StopPropagationDirective } from './stop-propagation.directive';

@Component({
  standalone: true,
  imports: [
    FullWidthDirective,
    PreventDefaultDirective,
    StopPropagationDirective,
    StopImmediatePropagationDirective,
  ],
  template: `
    <div id="outer" (click)="outerClick()">
      <a id="full" rxapFullWidth>full</a>
      <a id="prevent" rxapPreventDefault href="#x">prevent</a>
      <button id="stop" rxapStopPropagation>stop</button>
      <button id="stop-immediate" rxapStopImmediatePropagation>stop immediate</button>
    </div>
  `,
})
class HostComponent {
  public readonly outerClick = vi.fn();
}

describe('@rxap/directives', () => {
  describe('simple directives', () => {
    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const el = <T extends HTMLElement>(id: string) => fixture.nativeElement.querySelector(`#${ id }`) as T;
      return { fixture, el };
    }

    it('FullWidthDirective should set the width to 100%', () => {
      const { el } = setup();
      expect(el('full').style.width).toBe('100%');
    });

    it('PreventDefaultDirective should prevent the default action of the click', () => {
      const { el } = setup();
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      el('prevent').dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not prevent the default without the directive', () => {
      const { el } = setup();
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      el('stop').dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('StopPropagationDirective should stop the click from reaching the parent', () => {
      const { fixture, el } = setup();
      el('stop').click();
      expect(fixture.componentInstance.outerClick).not.toHaveBeenCalled();
    });

    it('clicks without the directive should bubble to the parent', () => {
      const { fixture, el } = setup();
      el('prevent').click();
      expect(fixture.componentInstance.outerClick).toHaveBeenCalledTimes(1);
    });

    it('StopImmediatePropagationDirective should stop the propagation to the parent and later listeners', () => {
      const { fixture, el } = setup();
      // registered after the directive host listener
      const laterListener = vi.fn();
      el('stop-immediate').addEventListener('click', laterListener);
      el('stop-immediate').click();
      expect(fixture.componentInstance.outerClick).not.toHaveBeenCalled();
      expect(laterListener).not.toHaveBeenCalled();
    });
  });
});
