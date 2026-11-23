import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MovableDividerDirective } from './movable-divider.directive';

@Component({
  standalone: true,
  imports: [ MovableDividerDirective ],
  template: `
    <div #container id="container">
      <div #fixed id="fixed"></div>
      <div id="divider" rxapMovableDivider [containerElement]="container" [fixedElement]="fixed" [origin]="origin()"></div>
    </div>
  `,
})
class HostComponent {
  public readonly origin = signal<any>('right');
}

describe('@rxap/directives', () => {
  describe('MovableDividerDirective', () => {
    function setup(origin: any = 'right') {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.origin.set(origin);
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('#container') as HTMLDivElement;
      const fixed = fixture.nativeElement.querySelector('#fixed') as HTMLDivElement;
      const divider = fixture.debugElement.query(By.directive(MovableDividerDirective));
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ left: 10 } as DOMRect);
      Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(fixed, 'clientWidth', { value: 100, configurable: true });
      const move = (clientX: number) => container.dispatchEvent(new MouseEvent('mousemove', { clientX }));
      return { fixture, container, fixed, divider, move };
    }

    it('should have a resize cursor', () => {
      const { divider } = setup();
      expect(divider.nativeElement.style.cursor).toBe('ew-resize');
    });

    it('should not resize on mousemove without a mousedown', () => {
      const { fixed, move } = setup();
      move(200);
      expect(fixed.style.maxWidth).toBe('');
    });

    it('should resize the fixed element relative to the left edge for the origin right', () => {
      const { fixed, divider, move } = setup('right');
      divider.triggerEventHandler('mousedown', undefined);
      move(210);
      expect(fixed.style.maxWidth).toBe('200px');
      expect(fixed.style.minWidth).toBe('200px');
      expect(fixed.style.flexBasis).toBe('200px');
    });

    it('should resize the fixed element relative to the right edge for the origin left', () => {
      vi.spyOn(console, 'log').mockImplementation(() => undefined);
      const { fixed, divider, move } = setup('left');
      divider.triggerEventHandler('mousedown', undefined);
      move(110);
      // clientWidth - clientX + left = 500 - 110 + 10
      expect(fixed.style.maxWidth).toBe('400px');
      expect(fixed.style.flexBasis).toBe('400px');
    });

    it('should stop resizing after mouseup', () => {
      const { container, fixed, divider, move } = setup();
      divider.triggerEventHandler('mousedown', undefined);
      move(110);
      container.dispatchEvent(new MouseEvent('mouseup'));
      move(310);
      expect(fixed.style.maxWidth).toBe('100px');
    });

    it('should throw for an unsupported origin', () => {
      vi.useFakeTimers();
      try {
        const { divider, container } = setup('top');
        divider.triggerEventHandler('mousedown', undefined);
        container.dispatchEvent(new MouseEvent('mousemove', { clientX: 10 }));
        // rxjs reports the error of the subscriber asynchronously
        expect(() => vi.advanceTimersByTime(0)).toThrow("The origin 'top' is not supported.");
      } finally {
        vi.useRealTimers();
      }
    });

    it('should stop listening on the old container when destroyed', () => {
      const { fixture, fixed, divider, move } = setup();
      divider.triggerEventHandler('mousedown', undefined);
      fixture.destroy();
      move(210);
      expect(fixed.style.maxWidth).toBe('');
    });
  });
});
