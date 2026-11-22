import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { AsyncActionAnimationDirective, AsyncActionDirective } from './async-action.directive';

@Component({
  imports: [MatButtonModule, AsyncActionDirective, AsyncActionAnimationDirective],
  template: `
    <button id="b" mat-button [rxapAsyncAction]="action"><span *rxapAsyncActionAnimation id="spin">x</span></button>
  `,
})
class HostComponent {
  action: () => Promise<any> | void = () => undefined;
}

describe('AsyncActionDirective', () => {
  const flush = () => new Promise<void>((r) => setTimeout(r));
  function setup(action: () => Promise<any> | void) {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.action = action;
    f.detectChanges();
    const dir = f.debugElement.children[0].injector.get(AsyncActionDirective);
    return { f, dir, btn: f.nativeElement.querySelector('#b') as HTMLButtonElement };
  }

  it('does nothing special for sync actions', () => {
    const action = jest.fn();
    const { btn, dir } = setup(action);
    btn.click();
    expect(action).toHaveBeenCalled();
    expect(btn.disabled).toBe(false);
    let loading = true;
    dir.loading$.subscribe((v: boolean) => (loading = v));
    expect(loading).toBe(false);
  });

  it('disables the button and shows the animation while the promise runs', async () => {
    let resolve!: () => void;
    const { f, btn, dir } = setup(() => new Promise<void>((r) => (resolve = r)));
    btn.click();
    f.detectChanges();
    expect(btn.disabled).toBe(true);
    expect(f.nativeElement.querySelector('#spin')).not.toBeNull();
    resolve();
    await flush();
    f.detectChanges();
    expect(btn.disabled).toBe(false);
    expect(f.nativeElement.querySelector('#spin')).toBeNull();
    expect(dir).toBeTruthy();
  });

  it('re-enables the button, stops loading and flags the error on rejection', async () => {
    const { f, btn, dir } = setup(() => Promise.reject(new Error('x')));
    let hasError = false;
    let loading = false;
    dir.hasError$.subscribe((v: boolean) => (hasError = v));
    dir.loading$.subscribe((v: boolean) => (loading = v));
    btn.click();
    await flush();
    f.detectChanges();
    expect(btn.disabled).toBe(false);
    expect(loading).toBe(false);
    expect(hasError).toBe(true);
  });

  it('throws when the input is not a function', () => {
    const { dir } = setup(() => undefined);
    jest.spyOn(dir, 'method' as any).mockReturnValue('nope');
    expect(() => dir.onClick()).toThrow('The method must be a function!');
  });
});
