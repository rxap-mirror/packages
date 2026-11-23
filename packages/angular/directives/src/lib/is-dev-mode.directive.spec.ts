import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IsDevModeDirective } from './is-dev-mode.directive';

@Component({
  standalone: true,
  imports: [ IsDevModeDirective ],
  template: `<span *rxapIsDevMode id="dev">dev</span>`,
})
class HostComponent {}

describe('@rxap/directives', () => {
  describe('IsDevModeDirective', () => {
    it('should render the template in dev mode', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#dev')).not.toBeNull();
    });

    it('should remove the rendered view on destroy', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      fixture.destroy();
      expect(element.querySelector('#dev')).toBeNull();
    });
  });
});
