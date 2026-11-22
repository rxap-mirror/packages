import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpRemoteMethodLoader } from '@rxap/remote-method/http';
import { ContenteditableDirective } from './contenteditable.directive';

@Component({
  standalone: true,
  imports: [ContenteditableDirective],
  template: `<div id="e" rxapContenteditable="update-item" property="title" uuid="u-1"></div>`,
})
class HostComponent {}

describe('ContenteditableDirective', () => {
  let request$: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    request$ = jest.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({ providers: [{ provide: HttpRemoteMethodLoader, useValue: { request$ } }] });
  });
  afterEach(() => jest.useRealTimers());

  function setup() {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    return f.nativeElement.querySelector('#e') as HTMLElement;
  }

  it('makes the host editable', () => {
    expect(setup().getAttribute('contenteditable')).toBe('true');
  });

  it('stops click propagation', () => {
    const el = setup();
    const parent = jest.fn();
    el.parentElement!.addEventListener('click', parent);
    el.click();
    expect(parent).not.toHaveBeenCalled();
  });

  it('sends the debounced value through the http remote method loader', async () => {
    const el = setup();
    el.textContent = 'abcd';
    el.dispatchEvent(new Event('input'));
    el.textContent = 'abcde';
    el.dispatchEvent(new Event('input'));
    expect(request$).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(request$).toHaveBeenCalledTimes(1);
    expect(request$).toHaveBeenCalledWith('update-item', {
      pathParams: { uuid: 'u-1' },
      body: { title: 'abcde' },
    });
  });

  it('ignores short values', () => {
    const el = setup();
    el.textContent = 'abc';
    el.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(1000);
    expect(request$).not.toHaveBeenCalled();
  });
});
