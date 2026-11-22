import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormWindowService } from './form-window.service';
import { OpenFormDirective, RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR } from './open-form.directive';

class Def {}

@Component({
  standalone: true,
  imports: [OpenFormDirective],
  template: `<button [rxapOpenForm]="def" [initial]="{ a: 1 }" title="T" width="10px" (submitted)="results.push($event)"></button>`,
})
class HostComponent {
  def: any = Def;
  results: any[] = [];
}

@Component({
  standalone: true,
  imports: [OpenFormDirective],
  template: `<button rxapOpenForm></button>`,
})
class DefaultHostComponent {}

describe('OpenFormDirective', () => {
  const ref = { close: jest.fn() };
  const open = jest.fn().mockReturnValue(ref);

  beforeEach(() => {
    open.mockClear();
    ref.close.mockClear();
    TestBed.configureTestingModule({
      imports: [HostComponent, DefaultHostComponent],
      providers: [{ provide: FormWindowService, useValue: { open } }],
    });
  });

  it('opens the form window with the directive options', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(OpenFormDirective));
    expect(el.nativeElement.getAttribute('type')).toBe('button');
    (el.injector.get(OpenFormDirective) as any).execute();
    const [ctor, options] = open.mock.calls[0];
    expect(ctor).toBe(Def);
    expect(options).toEqual(
      expect.objectContaining({ initial: { a: 1 }, title: 'T', width: '10px', injectorName: 'OpenFormDirective' }),
    );
  });

  it('emits submitted and closes the window on success', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(OpenFormDirective)).injector.get(OpenFormDirective);
    (directive as any).execute();
    directive.onSubmitSuccessful({ ok: true });
    expect(fixture.componentInstance.results).toEqual([{ ok: true }]);
    expect(ref.close).toHaveBeenCalled();
    fixture.destroy();
    expect(ref.close).toHaveBeenCalledTimes(2);
  });

  it('falls back to the injected constructor and warns on the default onSubmit', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DefaultHostComponent],
      providers: [
        { provide: FormWindowService, useValue: { open } },
        { provide: RXAP_WINDOW_FORM_SYSTEM_OPEN_FORM_CONSTRUCTOR, useValue: Def },
      ],
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(OpenFormDirective)).injector.get(OpenFormDirective);
    (directive as any).execute();
    expect(open.mock.calls[0][0]).toBe(Def);
    expect(directive.onSubmit()({} as any)).toEqual({});
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
