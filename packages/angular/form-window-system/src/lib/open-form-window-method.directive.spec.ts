import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { OpenFormWindowMethodDirective } from './open-form-window-method.directive';

@Component({
  standalone: true,
  imports: [OpenFormWindowMethodDirective],
  template: `
    <button
      [rxapOpenFormWindowMethod]="method"
      [initial]="initial"
      [rxapConfirm]="confirm()"
      (submitted)="submitted.push($event)"
      (failure)="failures.push($event)"
      (completed)="completed = completed + 1"
    ></button>
  `,
})
class HostComponent {
  windowRef = new Subject<any>();
  method = { call: jest.fn(() => this.windowRef) };
  initial = { a: 1 };
  confirm = signal(false);
  submitted: any[] = [];
  failures: any[] = [];
  completed = 0;
}

describe('OpenFormWindowMethodDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(OpenFormWindowMethodDirective));
    return {
      fixture,
      host: fixture.componentInstance,
      el,
      directive: el.injector.get(OpenFormWindowMethodDirective),
    };
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  it('calls the method on click and forwards window events', () => {
    const { host, el, directive } = setup();
    el.nativeElement.click();
    expect(host.method.call).toHaveBeenCalledWith({ a: 1 }, expect.objectContaining({ injector: expect.anything() }));
    expect(directive.executing$.value).toBe(1);
    host.windowRef.next('value');
    expect(host.submitted).toEqual(['value']);
    host.windowRef.complete();
    expect(host.completed).toBe(1);
    expect(directive.executing$.value).toBe(0);
  });

  it('forwards errors', () => {
    const { host, el } = setup();
    el.nativeElement.click();
    const error = new Error('x');
    host.windowRef.error(error);
    expect(host.failures).toEqual([error]);
  });

  it('skips the click when a confirm directive is present and executes on confirmed', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const { host, fixture, el } = setup();
    host.confirm.set(true);
    fixture.detectChanges();
    el.nativeElement.click();
    expect(host.method.call).not.toHaveBeenCalled();
    el.triggerEventHandler('confirmed');
    expect(host.method.call).toHaveBeenCalledTimes(1);
  });

  it('completes open windows on destroy', () => {
    const { host, fixture, directive } = setup();
    const ref = { complete: jest.fn() } as any;
    (directive as any)._windowRefInstance.add(ref);
    fixture.destroy();
    expect(ref.complete).toHaveBeenCalled();
    expect(host).toBeDefined();
  });
});
