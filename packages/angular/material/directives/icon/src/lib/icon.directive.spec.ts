import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { IconDirective } from './icon.directive';

@Component({
  imports: [MatIconModule, IconDirective],
  template: `<mat-icon [rxapIcon]="icon()"></mat-icon>`,
})
class HostComponent {
  icon = signal<any>('home');
}

describe('IconDirective', () => {
  function setup() {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const matIcon = f.debugElement.query(By.directive(MatIcon)).componentInstance as MatIcon;
    const el = f.nativeElement.querySelector('mat-icon') as HTMLElement;
    return { f, matIcon, el };
  }

  it('renders a ligature icon from a string', () => {
    const { el } = setup();
    expect(el.textContent).toBe('home');
  });

  it('applies material icon config with color, inline and font color', () => {
    const { f, el, matIcon } = setup();
    f.componentInstance.icon.set({ icon: 'star', color: 'primary', inline: true, fontColor: 'red' });
    f.detectChanges();
    expect(el.textContent).toBe('star');
    expect(matIcon.color).toBe('primary');
    expect(matIcon.inline).toBe(true);
    expect(el.style.color).toBe('red');
    f.componentInstance.icon.set({ icon: 'star' });
    f.detectChanges();
    expect(el.style.color).toBe('');
  });

  it('applies svg icon config', () => {
    const { f, matIcon } = setup();
    f.componentInstance.icon.set({ svgIcon: 'ns:logo', fontIcon: 'fi', fontSet: 'fs' });
    f.detectChanges();
    expect(matIcon.svgIcon).toBe('ns:logo');
    expect(matIcon.fontIcon).toBe('fi');
    expect(matIcon.fontSet).toBe('fs');
  });

  it('clears the icon when null', () => {
    const { f, el, matIcon } = setup();
    f.componentInstance.icon.set(null);
    f.detectChanges();
    expect(el.textContent).toBe('');
    expect(matIcon.svgIcon).toBe('');
  });
});
