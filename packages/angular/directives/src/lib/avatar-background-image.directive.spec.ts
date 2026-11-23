import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarImageService, ImageLoaderService } from '@rxap/services';
import { AvatarBackgroundImageDirective } from './avatar-background-image.directive';

@Component({
  standalone: true,
  imports: [ AvatarBackgroundImageDirective ],
  template: `<div [rxapAvatarBackgroundImage]="imageUrl()" [name]="name()" [placeholderImageUrl]="placeholder()"></div>`,
})
class HostComponent {
  public readonly imageUrl = input<string | null>(null);
  public readonly name = input<string | null>(null);
  public readonly placeholder = input<string | null>(null);
}

describe('@rxap/directives', () => {
  describe('AvatarBackgroundImageDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let div: HTMLDivElement;

    beforeEach(() => {
      vi.spyOn(TestBed.inject(ImageLoaderService), 'load').mockResolvedValue();
      fixture = TestBed.createComponent(HostComponent);
      div = fixture.nativeElement.querySelector('div');
    });

    async function flush() {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('should use cover / no-repeat as defaults', async () => {
      await flush();
      expect(div.style.backgroundSize).toBe('cover');
      expect(div.style.backgroundRepeat).toBe('no-repeat');
    });

    it('should use a generated avatar of the name as placeholder', async () => {
      const avatar = TestBed.inject(AvatarImageService).get({ name: 'Jane Doe' });
      fixture.componentRef.setInput('name', 'Jane Doe');
      await flush();
      expect(div.style.backgroundImage).toContain(avatar);
      expect(avatar).toContain('ui-avatars.com');
    });

    it('should prefer the explicit placeholder over the generated avatar', async () => {
      fixture.componentRef.setInput('name', 'Jane Doe');
      fixture.componentRef.setInput('placeholder', 'http://rxap.dev/placeholder.png');
      await flush();
      expect(div.style.backgroundImage).toContain('http://rxap.dev/placeholder.png');
      expect(div.style.backgroundImage).not.toContain('ui-avatars.com');
    });

    it('should replace the placeholder with the loaded image', async () => {
      fixture.componentRef.setInput('name', 'Jane Doe');
      fixture.componentRef.setInput('imageUrl', 'http://rxap.dev/me.png');
      await flush();
      expect(div.style.backgroundImage).toContain('http://rxap.dev/me.png');
    });

    it('should not set a background image without name, placeholder and image url', async () => {
      await flush();
      expect(div.style.backgroundImage).toBe('');
    });
  });
});
