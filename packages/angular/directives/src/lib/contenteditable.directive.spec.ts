import { ElementRef } from '@angular/core';
import { ContenteditableDirective } from './contenteditable.directive';

describe('@rxap/directives', () => {

  describe('ContenteditableDirective', () => {

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    function setup(textContent: string) {
      const element = { innerText: textContent, textContent };
      const directive = new ContenteditableDirective(new ElementRef<any>(element));
      directive.initial = 'old value';
      return { directive, element };
    }

    it('should keep the typed text when the save resolves without a value', async () => {
      const { directive, element } = setup('new value');
      directive.method = { call: jest.fn().mockResolvedValue(undefined) } as any;

      directive.onInput({ target: element } as any);
      await jest.advanceTimersByTimeAsync(1000);

      // the user's text must NOT be reverted to the initial value
      expect(element.innerText).toBe('new value');
      expect(directive.initial).toBe('new value');
    });

    it('should apply a canonical string returned by the handler', async () => {
      const { directive, element } = setup('new value');
      directive.method = { call: jest.fn().mockResolvedValue('Canonical') } as any;

      directive.onInput({ target: element } as any);
      await jest.advanceTimersByTimeAsync(1000);

      expect(element.innerText).toBe('Canonical');
      expect(directive.initial).toBe('Canonical');
    });

    it('should revert to the initial value when the save fails', async () => {
      const { directive, element } = setup('new value');
      directive.method = { call: jest.fn().mockRejectedValue(new Error('save failed')) } as any;

      directive.onInput({ target: element } as any);
      await jest.advanceTimersByTimeAsync(1000);

      expect(element.innerText).toBe('old value');
    });

  });

});
