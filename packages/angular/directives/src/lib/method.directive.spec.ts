import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MethodDirective } from './method.directive';

@Component({
  standalone: true,
  imports: [ MethodDirective ],
  template: `
    <button
      [rxapMethod]="method"
      [parameters]="parameters()"
      [immediately]="immediately()"
      [rxapConfirm]="confirm()"
      (executed)="executed($event)"
      (successful)="successful($event)"
      (failure)="failure($event)"
    ></button>
  `,
})
class HostComponent {
  public method: any = { call: vi.fn().mockResolvedValue('result') };
  public readonly parameters = signal<any>({ a: 1 });
  public readonly immediately = signal(false);
  public readonly confirm = signal(false);
  public readonly executed = vi.fn();
  public readonly successful = vi.fn();
  public readonly failure = vi.fn();
}

describe('@rxap/directives', () => {
  describe('MethodDirective', () => {
    function setup(configure?: (host: HostComponent) => void) {
      const fixture = TestBed.createComponent(HostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      const debugElement = fixture.debugElement.query(By.directive(MethodDirective));
      const directive = debugElement.injector.get(MethodDirective);
      return { fixture, host: fixture.componentInstance, debugElement, directive };
    }

    it('should not execute on init by default', () => {
      const { host } = setup();
      expect(host.method.call).not.toHaveBeenCalled();
    });

    it('should execute on init when immediately is set', async () => {
      const { host, fixture } = setup((h) => h.immediately.set(true));
      await fixture.whenStable();
      expect(host.method.call).toHaveBeenCalledWith({ a: 1 });
    });

    it('should execute on click and emit executed and successful', async () => {
      const { host, debugElement, directive } = setup();
      debugElement.nativeElement.click();
      await vi.waitFor(() => expect(host.successful).toHaveBeenCalledWith('result'));
      expect(host.method.call).toHaveBeenCalledTimes(1);
      expect(host.executed).toHaveBeenCalledWith('result');
      expect(host.failure).not.toHaveBeenCalled();
      expect(directive.executing$.value).toBe(false);
    });

    it('should not execute on click while waiting for a confirmation', async () => {
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      const { host, debugElement, directive } = setup((h) => h.confirm.set(true));
      debugElement.nativeElement.click();
      await directive.onClick();
      expect(host.method.call).not.toHaveBeenCalled();
      expect(debug).toHaveBeenCalledWith('Skip method call. Wait for confirmation.');
    });

    it('should execute when the confirmation is emitted', async () => {
      const { host, debugElement } = setup((h) => h.confirm.set(true));
      debugElement.triggerEventHandler('confirmed', undefined);
      await vi.waitFor(() => expect(host.successful).toHaveBeenCalledWith('result'));
      expect(host.method.call).toHaveBeenCalledTimes(1);
    });

    it('should emit failure and reset executing when the method rejects', async () => {
      const error = new Error('boom');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { host, directive } = setup((h) => h.method = { call: vi.fn().mockRejectedValue(error) });
      await directive.execute();
      expect(host.failure).toHaveBeenCalledWith(error);
      expect(host.successful).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith('Method directive execution failed:', 'boom');
      expect(directive.executing$.value).toBe(false);
    });

    it('should be executing while the method is pending', async () => {
      let resolve!: (value: string) => void;
      const { directive } = setup((h) => h.method = { call: vi.fn(() => new Promise((r) => resolve = r)) });
      const execution = directive.execute();
      expect(directive.executing$.value).toBe(true);
      resolve('done');
      await execution;
      expect(directive.executing$.value).toBe(false);
    });

    it('should merge parameters with setParameter and updateParameters', async () => {
      const { host, directive } = setup();
      directive.setParameter('b', 2);
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ a: 1, b: 2 });
      directive.updateParameters({ c: 3 });
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ a: 1, b: 2, c: 3 });
    });

    it('should start from empty parameters when none are bound', async () => {
      const { host, directive } = setup((h) => h.parameters.set(undefined));
      directive.setParameter('x', 1);
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ x: 1 });
    });

    it('should reset the current parameters when the bound parameters change', async () => {
      const { host, fixture, directive } = setup();
      directive.setParameter('b', 2);
      host.parameters.set({ z: 9 });
      fixture.detectChanges();
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ z: 9 });
    });
  });
});
