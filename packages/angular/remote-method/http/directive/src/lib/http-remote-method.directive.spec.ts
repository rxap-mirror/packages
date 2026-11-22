import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRemoteMethodDirective } from './http-remote-method.directive';
import { By } from '@angular/platform-browser';
import { RemoteMethodLoader } from '@rxap/remote-method';

describe('@rxap/remote-method/directive/button', () => {
  describe('HttpRemoteMethodDirective', () => {
    @Component({
      imports: [ HttpRemoteMethodDirective ],
      template: '<button rxapHttpRemoteMethod="test"></button>',
    })
    class TestComponent {}

    let componentfixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: HttpRemoteMethodDirective;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ TestComponent ],
        providers: [
          {
            provide: RemoteMethodLoader,
            useValue: {},
          },
        ],
      }).compileComponents();

      componentfixture = TestBed.createComponent(TestComponent);

      directiveElement = componentfixture.debugElement.query(
        By.directive(HttpRemoteMethodDirective),
      );

      expect(directiveElement).not.toBeNull();

      directive = directiveElement.injector.get(HttpRemoteMethodDirective);

      expect(directive).toBeInstanceOf(HttpRemoteMethodDirective);

      componentfixture.detectChanges();
    });

    it('should call execute on button click', () => {
      const executeSpy = jest.spyOn(directive, 'execute');

      const button = componentfixture.debugElement.query(By.css('button'));

      button.nativeElement.click();

      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('HttpRemoteMethodDirective inputs', () => {
  @Component({
    imports: [HttpRemoteMethodDirective],
    template: `
      <button
        rxapHttpRemoteMethod="m"
        [body]="body()"
        [pathParams]="pathParams()"
        [setHeaders]="{ A: 'b' }"
        [withCredentials]="true"
        (successful)="done = $event"
      ></button>
    `,
  })
  class InputsHostComponent {
    body = signal<any>({ a: 1 });
    pathParams = signal<any>({ id: 1 });
    done: unknown;
  }

  it('merges the bound http inputs into the call parameters', async () => {
    const call$ = jest.fn().mockResolvedValue('ok');
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    const f = TestBed.createComponent(InputsHostComponent);
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    await new Promise<void>((r) => setTimeout(r));
    expect(call$.mock.calls[0][0]).toBe('m');
    expect(call$.mock.calls[0][1]).toEqual({
      body: { a: 1 },
      pathParams: { id: 1 },
      setHeaders: { A: 'b' },
      withCredentials: true,
    });
    expect(f.componentInstance.done).toBe('ok');

    f.componentInstance.pathParams.set({ id: 2 });
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    await new Promise<void>((r) => setTimeout(r));
    expect(call$.mock.calls[1][1].pathParams).toEqual({ id: 2 });
  });

  it('passes no parameters when no http input is bound', async () => {
    @Component({ imports: [HttpRemoteMethodDirective], template: '<button rxapHttpRemoteMethod="m"></button>' })
    class PlainHost {}
    const call$ = jest.fn().mockResolvedValue('ok');
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    const f = TestBed.createComponent(PlainHost);
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    await new Promise<void>((r) => setTimeout(r));
    expect(call$.mock.calls[0][1]).toBeUndefined();
  });
});
