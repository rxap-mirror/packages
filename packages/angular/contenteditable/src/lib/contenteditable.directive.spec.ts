import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContenteditableDirective } from './contenteditable.directive';

@Component({
  standalone: true,
  imports: [ ContenteditableDirective ],
  template: `<div [rxapContenteditable]="method()" [disabled]="disabled()" (change)="changes.push($event)">text</div>`,
})
class HostComponent {
  method = signal<any>(undefined);
  disabled = signal(false);
  changes: Array<string | null> = [];
}

describe('ContenteditableDirective', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(ContenteditableDirective));
    return { fixture, el: debugEl.nativeElement as HTMLElement, host: fixture.componentInstance };
  }

  it('sets contenteditable attribute depending on disabled', () => {
    const { fixture, el, host } = setup();
    expect(el.getAttribute('contenteditable')).toBe('true');
    host.disabled.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('contenteditable')).toBe('false');
  });

  it('stops click propagation', () => {
    const { el } = setup();
    const parentSpy = jest.fn();
    el.parentElement!.addEventListener('click', parentSpy);
    el.click();
    expect(parentSpy).not.toHaveBeenCalled();
  });

  it('emits change debounced and calls method', () => {
    const { fixture, el, host } = setup();
    const method = { call: jest.fn() };
    host.method.set(method);
    fixture.detectChanges();
    el.textContent = 'new value';
    el.dispatchEvent(new Event('input'));
    expect(host.changes).toEqual([]);
    jest.advanceTimersByTime(1000);
    expect(host.changes).toEqual([ 'new value' ]);
    expect(method.call).toHaveBeenCalledWith('new value');
  });

  it('emits without method', () => {
    const { el, host } = setup();
    el.textContent = 'x';
    el.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(1000);
    expect(host.changes).toEqual([ 'x' ]);
  });

  it('does not emit when disabled', () => {
    const { fixture, el, host } = setup();
    const method = { call: jest.fn() };
    host.method.set(method);
    host.disabled.set(true);
    fixture.detectChanges();
    el.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(1000);
    expect(host.changes).toEqual([]);
    expect(method.call).not.toHaveBeenCalled();
  });
});
