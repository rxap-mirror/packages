import { Component, INJECTOR, Injector, Provider, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { RxapForm } from '../decorators/form';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormControlMarkDirtyDirective } from './form-control-mark-dirty.directive';
import { FormControlMarkPristineDirective } from './form-control-mark-pristine.directive';
import { FormControlMarkTouchedDirective } from './form-control-mark-touched.directive';
import { FormControlMarkUntouchedDirective } from './form-control-mark-untouched.directive';
import { FormLoadedDirective } from './form-loaded.directive';
import { FormLoadingErrorDirective } from './form-loading-error.directive';
import { FormLoadingDirective } from './form-loading.directive';
import { FormResetDirective } from './form-reset.directive';
import { FormSubmitFailedDirective } from './form-submit-failed.directive';
import { FormSubmitInvalidDirective } from './form-submit-invalid.directive';
import { FormSubmitSuccessfulDirective } from './form-submit-successful.directive';
import { FormSubmitDirective } from './form-submit.directive';
import { FormSubmittingDirective } from './form-submitting.directive';
import { FormDirective } from './form.directive';
import { RXAP_FORM_DEFINITION, RXAP_FORM_DEFINITION_BUILDER } from './tokens';

@RxapForm('directives-test')
class TestForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ validators: [(c: any) => (c.value === 'bad' ? { bad: true } : null)] })
  public username!: RxapFormControl;
}

const formProviders: Provider[] = [
  TestForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) => new RxapFormBuilder<any>(TestForm as any, injector),
    deps: [INJECTOR],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps: [RXAP_FORM_DEFINITION_BUILDER],
  },
];

const imports = [
  FormDirective, FormSubmitDirective, FormResetDirective, FormLoadingDirective, FormLoadedDirective,
  FormLoadingErrorDirective, FormSubmitFailedDirective, FormSubmittingDirective, FormSubmitInvalidDirective,
  FormSubmitSuccessfulDirective, FormControlMarkDirtyDirective, FormControlMarkPristineDirective,
  FormControlMarkTouchedDirective, FormControlMarkUntouchedDirective, ReactiveFormsModule,
];

@Component({
  standalone: true,
  imports,
  providers: formProviders,
  template: `
    <form rxapForm #f="rxapForm" [submitMethod]="submit" [loadMethod]="load" (rxapSubmit)="submitted.push($event)"
          (submitSuccessful)="success.push($event)" (invalidSubmit)="invalid.push($event)">
      <input formControlName="username" />
      <p *rxapFormLoading class="loading">loading</p>
      <p *rxapFormLoaded class="loaded">loaded</p>
      <p *rxapFormLoadingError="let e" class="load-error">{{ e.message }}</p>
      <p *rxapFormSubmitting class="submitting">submitting</p>
      <p *rxapFormSubmitFailed="let e" class="submit-error">{{ e.message }}</p>
      <p *rxapFormSubmitInvalid="let e" class="invalid">invalid</p>
      <p *rxapFormSubmitSuccessful="let r" class="success">ok {{ r.username }}</p>
      <button class="submit" rxapFormSubmit type="button" (afterSubmit)="after.push($event)" [resetAfterSubmit]="reset" [navigateAfterSubmit]="nav">go</button>
      <button class="reset" rxapFormReset>reset</button>
      <button class="dirty" rxapFormControlMarkDirty></button>
      <button class="pristine" rxapFormControlMarkPristine></button>
      <button class="touched" rxapFormControlMarkTouched></button>
      <button class="untouched" rxapFormControlMarkUntouched></button>
    </form>`,
})
class Host {
  dir = viewChild.required(FormDirective);
  submitted: any[] = [];
  success: any[] = [];
  invalid: any[] = [];
  after: any[] = [];
  reset = false;
  nav?: string[];
  submit: any = { call: vi.fn(async (v: any) => v) };
  load: any = { call: vi.fn(async () => ({ username: 'loaded' })) };
}

describe('form directives', () => {
  let f: ComponentFixture<Host>;
  let host: Host;
  const q = (sel: string) => f.nativeElement.querySelector(sel) as HTMLElement | null;
  const settle = async () => {
    for (let i = 0; i < 3; i++) {
      f.detectChanges();
      await f.whenStable();
      await new Promise((r) => setTimeout(r, 0));
    }
    f.detectChanges();
  };

  const create = async (configure?: (h: Host) => void) => {
    TestBed.configureTestingModule({ imports: [Host], providers: [provideRouter([])] });
    f = TestBed.createComponent(Host);
    host = f.componentInstance;
    configure?.(host);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await settle();
  };

  afterEach(() => vi.restoreAllMocks());

  it('loads the form and renders loaded state', async () => {
    await create();
    expect(host.load.call).toHaveBeenCalled();
    expect(q('.loaded')).toBeTruthy();
    expect(q('.loading')).toBeNull();
    expect(host.dir().form.value).toEqual({ username: 'loaded' });
    expect(q('form')!.classList.contains('rxap-loaded')).toBe(true);
  });

  it('shows the loading error', async () => {
    await create((h) => (h.load = { call: vi.fn(async () => { throw new Error('nope'); }) }));
    expect(q('.load-error')!.textContent).toBe('nope');
    expect(q('form')!.classList.contains('rxap-loading-error')).toBe(true);
  });

  it('submit button marks controls, submits, emits and renders the success state', async () => {
    await create();
    q('.submit')!.click();
    await settle();
    expect(host.submit.call).toHaveBeenCalledWith({ username: 'loaded' }, null, null);
    expect(host.submitted).toEqual([{ username: 'loaded' }]);
    expect(host.success).toEqual([{ username: 'loaded' }]);
    expect(host.after).toEqual([{ username: 'loaded' }]);
    expect(q('.success')!.textContent).toBe('ok loaded');
    expect(host.dir().form.dirty).toBe(true);
    expect(host.dir().form.touched).toBe(true);
  });

  it('shows the submitting state while the submit is pending', async () => {
    let resolve!: (v: any) => void;
    await create((h) => (h.submit = { call: vi.fn(() => new Promise((r) => (resolve = r))) }));
    q('.submit')!.click();
    f.detectChanges();
    expect(q('.submitting')).toBeTruthy();
    expect((q('.submit') as HTMLButtonElement).disabled).toBe(true);
    expect(q('form')!.classList.contains('rxap-submitting')).toBe(true);
    resolve('done');
    await settle();
    expect(q('.submitting')).toBeNull();
    expect((q('.submit') as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows submit failures', async () => {
    await create((h) => (h.submit = { call: vi.fn(async () => { throw new Error('sub'); }) }));
    q('.submit')!.click();
    await settle();
    expect(q('.submit-error')!.textContent).toBe('sub');
    expect(q('form')!.classList.contains('rxap-submit-error')).toBe(true);
  });

  it('reports invalid submits', async () => {
    await create();
    host.dir().form.get('username')!.setValue('bad');
    q('.submit')!.click();
    await settle();
    expect(host.invalid).toHaveLength(1);
    expect(q('.invalid')).toBeTruthy();
    expect(host.submit.call).not.toHaveBeenCalled();
  });

  it('resets after submit and navigates when configured', async () => {
    await create((h) => {
      h.reset = true;
      h.nav = ['/target'];
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const resetSpy = vi.spyOn(host.dir(), 'reset');
    q('.submit')!.click();
    await settle();
    expect(resetSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/target']);
  });

  it('reset button resets the form', async () => {
    await create();
    const spy = vi.spyOn(host.dir(), 'reset');
    q('.reset')!.click();
    expect(spy).toHaveBeenCalled();
  });

  it('mark buttons update the control state', async () => {
    await create();
    const form = host.dir().form;
    q('.dirty')!.click();
    expect(form.dirty).toBe(true);
    q('.pristine')!.click();
    expect(form.pristine).toBe(true);
    q('.touched')!.click();
    expect(form.touched).toBe(true);
    q('.untouched')!.click();
    expect(form.touched).toBe(false);
  });

  it('mark directives fall back to the plain control methods', () => {
    const control = { markAsDirty: vi.fn(), markAsPristine: vi.fn(), markAsUntouched: vi.fn() } as any;
    TestBed.configureTestingModule({
      providers: [
        { provide: require('@angular/forms').ControlContainer, useValue: { control } },
      ],
    });
    TestBed.runInInjectionContext(() => {
      new FormControlMarkDirtyDirective().onClick();
      new FormControlMarkPristineDirective().onClick();
      new FormControlMarkUntouchedDirective().onClick();
    });
    expect(control.markAsDirty).toHaveBeenCalled();
    expect(control.markAsPristine).toHaveBeenCalled();
    expect(control.markAsUntouched).toHaveBeenCalled();
  });
});
