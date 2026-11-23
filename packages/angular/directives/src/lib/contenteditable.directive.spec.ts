import { Component } from '@angular/core';
import type { Mock } from 'vitest';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContenteditableDirective } from './contenteditable.directive';

@Component({
  standalone: true,
  imports: [ ContenteditableDirective ],
  template: `<div [rxapContenteditable]="null!" [initial]="'old value'"></div>`,
})
class HostComponent {}

describe('@rxap/directives', () => {
  describe('ContenteditableDirective', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    function setup(textContent: string) {
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const debugElement = fixture.debugElement.query(By.directive(ContenteditableDirective));
      const directive = debugElement.injector.get(ContenteditableDirective);
      const element = debugElement.nativeElement as HTMLElement;
      element.textContent = textContent;
      return { directive, element };
    }

    function mockMethod(directive: ContenteditableDirective, call: Mock) {
      (directive as any).method = () => ({ call });
    }

    it('should keep the typed text when the save resolves without a value', async () => {
      const { directive, element } = setup('new value');
      mockMethod(directive, vi.fn().mockResolvedValue(undefined));

      directive.onInput({ target: element } as any);
      await vi.advanceTimersByTimeAsync(1000);

      // the user's text must NOT be reverted to the initial value
      expect(element.textContent).toBe('new value');
      expect(directive.initial()).toBe('new value');
    });

    it('should apply a canonical string returned by the handler', async () => {
      const { directive, element } = setup('new value');
      mockMethod(directive, vi.fn().mockResolvedValue('Canonical'));

      directive.onInput({ target: element } as any);
      await vi.advanceTimersByTimeAsync(1000);

      expect(element.innerText).toBe('Canonical');
      expect(directive.initial()).toBe('Canonical');
    });

    it('should revert to the initial value when the save fails', async () => {
      const { directive, element } = setup('new value');
      mockMethod(directive, vi.fn().mockRejectedValue(new Error('save failed')));

      directive.onInput({ target: element } as any);
      await vi.advanceTimersByTimeAsync(1000);

      expect(element.innerText).toBe('old value');
    });
  });
});
