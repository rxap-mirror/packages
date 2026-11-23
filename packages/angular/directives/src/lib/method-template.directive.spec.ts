import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MethodTemplateDirective } from './method-template.directive';

@Component({
  standalone: true,
  imports: [ MethodTemplateDirective ],
  template: `
    <ng-template #loading><span id="loading">loading</span></ng-template>
    <ng-template #error let-message="message"><span id="error">{{ message }}</span></ng-template>
    <ng-template
      rxapMethod
      [rxapMethodCall]="method"
      [rxapMethodParameters]="parameters()"
      [rxapMethodWithoutParameters]="withoutParameters()"
      [rxapMethodLoading]="useLoading() ? loadingTemplate() : undefined"
      [rxapMethodError]="useError() ? errorTemplate() : undefined"
      [immediately]="immediately()"
      (executed)="executed($event)"
      (successful)="successful($event)"
      (failure)="failure($event)"
      (embedded)="embedded()"
      (executing)="executing($event)"
      let-result
    >
      <span id="result">{{ result }}</span>
    </ng-template>
  `,
})
class HostComponent {
  public method: any = { call: vi.fn().mockResolvedValue('value') };
  public readonly parameters = signal<any>(undefined);
  public readonly withoutParameters = signal(false);
  public readonly immediately = signal(false);
  public readonly useLoading = signal(false);
  public readonly useError = signal(false);
  public readonly loadingTemplate = viewChild.required<TemplateRef<void>>('loading');
  public readonly errorTemplate = viewChild.required<TemplateRef<any>>('error');
  public readonly executed = vi.fn();
  public readonly successful = vi.fn();
  public readonly failure = vi.fn();
  public readonly embedded = vi.fn();
  public readonly executing = vi.fn();
}

describe('@rxap/directives', () => {
  describe('MethodTemplateDirective', () => {
    function setup(configure?: (host: HostComponent) => void) {
      const fixture = TestBed.createComponent(HostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      const directive = fixture.debugElement.queryAllNodes(By.directive(MethodTemplateDirective))[0].injector.get(MethodTemplateDirective);
      const text = (id: string) => (fixture.nativeElement as HTMLElement).querySelector(`#${ id }`)?.textContent ?? null;
      return { fixture, host: fixture.componentInstance, directive, text };
    }

    it('should not execute without parameters by default', async () => {
      const { host, fixture } = setup();
      await fixture.whenStable();
      expect(host.method.call).not.toHaveBeenCalled();
    });

    it('should execute immediately when withoutParameters is set', async () => {
      const { host, fixture, text } = setup((h) => h.withoutParameters.set(true));
      await vi.waitFor(() => expect(host.successful).toHaveBeenCalledWith('value'));
      fixture.detectChanges();
      expect(host.method.call).toHaveBeenCalledWith(undefined);
      expect(host.executed).toHaveBeenCalledWith('value');
      expect(host.embedded).toHaveBeenCalledTimes(1);
      expect(text('result')).toBe('value');
    });

    it('should execute when parameters are bound and again when they change', async () => {
      const { host, fixture } = setup((h) => h.parameters.set({ id: 1 }));
      await vi.waitFor(() => expect(host.method.call).toHaveBeenCalledWith({ id: 1 }));
      host.parameters.set({ id: 2 });
      fixture.detectChanges();
      await vi.waitFor(() => expect(host.method.call).toHaveBeenCalledWith({ id: 2 }));
      expect(host.method.call).toHaveBeenCalledTimes(2);
    });

    it('should render the loading template until the method is executed', () => {
      const { text } = setup((h) => h.useLoading.set(true));
      expect(text('loading')).toBe('loading');
    });

    it('should replace the loading template with the result', async () => {
      const { host, fixture, text } = setup((h) => {
        h.useLoading.set(true);
        h.parameters.set({});
      });
      fixture.detectChanges();
      await vi.waitFor(() => expect(host.successful).toHaveBeenCalled());
      fixture.detectChanges();
      expect(text('loading')).toBeNull();
      expect(text('result')).toBe('value');
    });

    it('should emit the executing state', async () => {
      const { host, directive } = setup();
      host.executing.mockClear();
      await directive.execute({});
      expect(host.executing.mock.calls.map((c) => c[0])).toEqual([ true, false ]);
    });

    it('should render the error template and emit failure when the method rejects', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const error = new Error('boom');
      const { host, fixture, directive, text } = setup((h) => {
        h.method = { call: vi.fn().mockRejectedValue(error) };
        h.useError.set(true);
      });
      await directive.execute({});
      fixture.detectChanges();
      expect(host.failure).toHaveBeenCalledWith(error);
      expect(host.successful).not.toHaveBeenCalled();
      expect(text('error')).toBe('boom');
    });

    it('should emit failure without an error template', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { host, fixture, directive, text } = setup((h) => h.method = { call: vi.fn().mockRejectedValue(new Error('boom')) });
      await directive.execute({});
      fixture.detectChanges();
      expect(host.failure).toHaveBeenCalledTimes(1);
      expect(text('error')).toBeNull();
    });

    it('should merge parameters with setParameter and updateParameters', async () => {
      const { host, directive } = setup();
      directive.setParameter('a', 1);
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ a: 1 });
      directive.updateParameters({ b: 2 });
      await directive.execute();
      expect(host.method.call).toHaveBeenLastCalledWith({ a: 1, b: 2 });
    });

    it('should execute with the current parameters when confirmed', async () => {
      const { host, fixture, directive } = setup();
      directive.setParameter('a', 1);
      await directive.onConfirmed();
      fixture.detectChanges();
      expect(host.method.call).toHaveBeenCalledWith({ a: 1 });
    });

    it('should report an error thrown while rendering the result and rethrow it', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { host, directive } = setup((h) => h.useError.set(true));
      const failure = new Error('render failed');
      vi.spyOn((directive as any).viewContainerRef, 'createEmbeddedView').mockImplementationOnce(() => {
        throw failure;
      });
      expect(() => (directive as any).renderTemplate('x')).toThrow(failure);
      expect(consoleError).toHaveBeenCalledWith('render failed');
      expect(host.embedded).not.toHaveBeenCalled();
    });
  });
});
