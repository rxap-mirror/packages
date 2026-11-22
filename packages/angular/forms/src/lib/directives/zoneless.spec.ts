import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, INJECTOR, Injector, Provider, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RxapForm } from '../decorators/form';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormControlErrorDirective } from './form-control-error.directive';
import { FormLoadedDirective } from './form-loaded.directive';
import { FormLoadingErrorDirective } from './form-loading-error.directive';
import { FormLoadingDirective } from './form-loading.directive';
import { FormSubmitFailedDirective } from './form-submit-failed.directive';
import { FormSubmitInvalidDirective } from './form-submit-invalid.directive';
import { FormSubmitSuccessfulDirective } from './form-submit-successful.directive';
import { FormSubmitDirective } from './form-submit.directive';
import { FormSubmittingDirective } from './form-submitting.directive';
import { FormDirective } from './form.directive';
import { RXAP_FORM_DEFINITION, RXAP_FORM_DEFINITION_BUILDER } from './tokens';

@RxapForm('zoneless-directives-test')
class ZonelessForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ validators: [ Validators.required ] })
  public username!: RxapFormControl;
}

const formProviders: Provider[] = [
  ZonelessForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) => new RxapFormBuilder<any>(ZonelessForm, injector),
    deps: [ INJECTOR ],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps: [ RXAP_FORM_DEFINITION_BUILDER ],
  },
];

/**
 * The host is OnPush and the specs never call fixture.detectChanges(): the views must be refreshed
 * by the zoneless scheduler only, which is the behavior of a real zoneless application.
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormDirective, FormSubmitDirective, FormLoadingDirective, FormLoadedDirective, FormLoadingErrorDirective,
    FormSubmitFailedDirective, FormSubmittingDirective, FormSubmitInvalidDirective, FormSubmitSuccessfulDirective,
    FormControlErrorDirective, ReactiveFormsModule, JsonPipe,
  ],
  providers: formProviders,
  template: `
    <form rxapForm [submitMethod]="submit" [loadMethod]="load">
      <input formControlName="username" />
      <p *rxapFormLoading class="loading">loading</p>
      <p *rxapFormLoaded class="loaded">loaded</p>
      <p *rxapFormLoadingError="let e" class="load-error">{{ e.message }}</p>
      <p *rxapFormSubmitting class="submitting">submitting</p>
      <p *rxapFormSubmitFailed="let e" class="submit-error">{{ e.message }}</p>
      <p *rxapFormSubmitInvalid="let e" class="invalid">invalid {{ e | json }}</p>
      <p *rxapFormSubmitSuccessful="let r" class="success">ok {{ r.username }}</p>
      <p *rxapFormControlError="let e; from: 'username'; if: 'required'" class="control-error">required {{ e }}</p>
      <button class="submit" rxapFormSubmit>go</button>
    </form>`,
})
class OnPushHost {
  dir = viewChild.required(FormDirective);
  submit: any = { call: jest.fn(async (v: any) => v) };
  load: any = { call: jest.fn(async () => ({ username: 'loaded' })) };
}

describe('form directives (zoneless, OnPush host, no manual detectChanges)', () => {
  let f: ComponentFixture<OnPushHost>;
  let host: OnPushHost;
  const q = (sel: string) => f.nativeElement.querySelector(sel) as HTMLElement | null;

  const create = async (configure?: (h: OnPushHost) => void) => {
    TestBed.configureTestingModule({ imports: [ OnPushHost ] });
    f = TestBed.createComponent(OnPushHost);
    host = f.componentInstance;
    configure?.(host);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await f.whenStable();
  };

  afterEach(() => jest.restoreAllMocks());

  it('renders the loaded state after an async load', async () => {
    await create();
    expect(q('.loaded')).toBeTruthy();
    expect(q('.loading')).toBeNull();
  });

  it('renders the loading error after a failed async load', async () => {
    await create((h) => (h.load = { call: jest.fn(async () => { throw new Error('nope'); }) }));
    expect(q('.load-error')?.textContent).toBe('nope');
  });

  it('renders the submit result states', async () => {
    await create();
    host.dir().form.setValue({ username: 'user' });
    q('.submit')!.click();
    await f.whenStable();
    expect(q('.success')?.textContent).toBe('ok user');
    expect(q('.submitting')).toBeNull();
  });

  it('renders the submit failed state', async () => {
    await create((h) => (h.submit = { call: jest.fn(async () => { throw new Error('sub'); }) }));
    host.dir().form.setValue({ username: 'user' });
    q('.submit')!.click();
    await f.whenStable();
    expect(q('.submit-error')?.textContent).toBe('sub');
  });

  it('renders the invalid submit state', async () => {
    await create();
    host.dir().form.setValue({ username: '' });
    q('.submit')!.click();
    await f.whenStable();
    expect(q('.invalid')?.textContent).toContain('invalid {');
  });

  it('renders the control error when the control state changes outside of a template event', async () => {
    await create();
    host.dir().form.setValue({ username: 'user' });
    await f.whenStable();
    expect(q('.control-error')).toBeNull();
    host.dir().form.setValue({ username: '' });
    await f.whenStable();
    expect(q('.control-error')?.textContent).toBe('required true');
  });
});
