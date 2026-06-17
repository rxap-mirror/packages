import {
  BackgroundImageDirective,
  BackgroundSizeOptions,
} from './background-image.directive';
import {
  ElementRef,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImageLoaderService } from '@rxap/services';

describe('@rxap/directives', () => {

  describe('BackgroundImageDirective', () => {

    let divElement: HTMLDivElement;
    let renderer2: Renderer2;
    let directive: BackgroundImageDirective;
    let imageLoaderService: ImageLoaderService;

    let setStyleSpy: jest.SpyInstance;
    let loadSpy: jest.SpyInstance;

    beforeEach(() => {
      divElement = document.createElement('div');
      renderer2 = TestBed.inject(RendererFactory2).createRenderer(null, null);
      imageLoaderService = TestBed.inject(ImageLoaderService);
      directive = new BackgroundImageDirective(
        new ElementRef<any>(divElement),
        renderer2,
        imageLoaderService,
      );
      setStyleSpy = jest.spyOn(renderer2, 'setStyle');
      loadSpy = jest.spyOn(imageLoaderService, 'load').mockResolvedValue();
    });

    xit('should add background image to element', () => {

      const imageUrl = 'http://rxap.dev/image.jng';

      directive.ngOnChanges({
        imageUrl: {
          currentValue: imageUrl,
        } as any,
      });

      expect(setStyleSpy).toBeCalledTimes(2);

      expect(setStyleSpy).toBeCalled();
      expect(setStyleSpy.mock.calls[1]).toEqual([ divElement, 'background-image', `url("${ imageUrl }")` ]);

      expect(divElement.style.backgroundImage).toContain(imageUrl);

    });

    describe('should set background size', () => {

      it('null', () => {

        directive.ngOnChanges({
          size: {
            currentValue: null,
          } as any,
        });

        expect(setStyleSpy).toBeCalled();
        expect(setStyleSpy).toBeCalledWith(divElement, 'background-size', null);

        expect(divElement.style.backgroundSize).toContain('');

      });

      it(BackgroundSizeOptions.AUTO, () => {

        directive.ngOnChanges({
          size: {
            currentValue: BackgroundSizeOptions.AUTO,
          } as any,
        });

        expect(setStyleSpy).toBeCalled();
        expect(setStyleSpy).toBeCalledWith(divElement, 'background-size', BackgroundSizeOptions.AUTO);

        expect(divElement.style.backgroundSize).toContain(BackgroundSizeOptions.AUTO);

      });

      // TODO : add test for all possible values

    });

    describe('imageUrl', () => {

      it('should clear the background image when the url is set to null', async () => {
        const removeStyleSpy = jest.spyOn(renderer2, 'removeStyle');

        directive.ngOnChanges({ imageUrl: { currentValue: null } as any });
        await Promise.resolve();

        expect(removeStyleSpy).toBeCalledWith(divElement, 'background-image');
      });

      it('should ignore a stale image load when a newer url was requested', async () => {
        let resolveFirst!: () => void;
        loadSpy.mockReset();
        loadSpy
          .mockImplementationOnce(() => new Promise<void>(resolve => { resolveFirst = resolve; }))
          .mockImplementationOnce(() => Promise.resolve());

        const slow = (directive as any).imageUrlChange('first.png');
        const fast = (directive as any).imageUrlChange('second.png');
        await fast;
        resolveFirst();
        await slow;

        const bgCalls = setStyleSpy.mock.calls.filter(call => call[1] === 'background-image');
        expect(bgCalls.some(call => call[2] === 'url("second.png")')).toBe(true);
        expect(bgCalls.some(call => call[2] === 'url("first.png")')).toBe(false);
      });

    });

    // TODO : add tests for all possible inputs

  });

});


