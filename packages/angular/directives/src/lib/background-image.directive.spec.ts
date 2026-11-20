import {
  BackgroundImageDirective,
  BackgroundSizeOptions,
} from './background-image.directive';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageLoaderService } from '@rxap/services';

@Component({
  standalone: true,
  imports: [ BackgroundImageDirective ],
  template: `<div [rxapBackgroundImage]="imageUrl()" [size]="size()"></div>`,
})
class HostComponent {
  public readonly imageUrl = input<string | null>(null);
  public readonly size = input<string | null>(null);
}

describe('@rxap/directives', () => {
  describe('BackgroundImageDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let divElement: HTMLDivElement;
    let imageLoaderService: ImageLoaderService;
    let loadSpy: jest.SpyInstance;

    beforeEach(() => {
      imageLoaderService = TestBed.inject(ImageLoaderService);
      loadSpy = jest.spyOn(imageLoaderService, 'load').mockResolvedValue();
      fixture = TestBed.createComponent(HostComponent);
      divElement = fixture.nativeElement.querySelector('div');
    });

    async function flush() {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    describe('should set background size', () => {
      it('value', async () => {
        fixture.componentRef.setInput('size', BackgroundSizeOptions.CONTAIN);
        await flush();
        expect(divElement.style.backgroundSize).toContain(BackgroundSizeOptions.CONTAIN);
      });

      it('null removes the style', async () => {
        fixture.componentRef.setInput('size', BackgroundSizeOptions.CONTAIN);
        await flush();
        fixture.componentRef.setInput('size', null);
        await flush();
        expect(divElement.style.backgroundSize).toBe('');
      });
    });

    describe('imageUrl', () => {
      it('should load the image and set it as background', async () => {
        fixture.componentRef.setInput('imageUrl', 'http://rxap.dev/image.png');
        await flush();
        expect(loadSpy).toHaveBeenCalledWith('http://rxap.dev/image.png');
        expect(divElement.style.backgroundImage).toContain('http://rxap.dev/image.png');
      });

      it('should clear the background image when the url is set to null', async () => {
        fixture.componentRef.setInput('imageUrl', 'http://rxap.dev/image.png');
        await flush();
        fixture.componentRef.setInput('imageUrl', null);
        await flush();
        expect(divElement.style.backgroundImage).toBe('');
      });

      it('should ignore a stale image load when a newer url was requested', async () => {
        let resolveFirst!: () => void;
        loadSpy.mockReset();
        loadSpy
          .mockImplementationOnce(() => new Promise<void>((resolve) => {
            resolveFirst = resolve;
          }))
          .mockImplementationOnce(() => Promise.resolve());

        const directive = fixture.debugElement.query(By.directive(BackgroundImageDirective)).injector.get(BackgroundImageDirective);
        const slow = (directive as any).imageUrlChange('first.png');
        const fast = (directive as any).imageUrlChange('second.png');
        await fast;
        resolveFirst();
        await slow;

        expect(divElement.style.backgroundImage).toContain('second.png');
        expect(divElement.style.backgroundImage).not.toContain('first.png');
      });
    });
  });
});
