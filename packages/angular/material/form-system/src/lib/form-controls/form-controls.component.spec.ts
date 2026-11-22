import { Component, INJECTOR, Injector, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  FormDirective,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { FormControlsComponent } from './form-controls.component';

@RxapForm('form-controls-test')
class TestForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ validators: [(c: any) => (c.value ? null : { required: true })] })
  public name!: RxapFormControl<string>;
}

@Component({
  standalone: true,
  imports: [FormDirective, FormControlsComponent],
  providers: [
    {
      provide: RXAP_FORM_DEFINITION,
      useFactory: (injector: Injector) => new RxapFormBuilder<any>(TestForm, injector).build(),
      deps: [INJECTOR],
    },
  ],
  template: `
    <form rxapForm [submitMethod]="submitMethod" (rxapSubmit)="submitted.push($event)">
      <rxap-form-controls
        [allowResubmit]="allowResubmit"
        [navigateAfterSubmit]="navigate"
        (close)="closed.push($event)"
        (submitted)="controlsSubmitted.push($event)"
      ></rxap-form-controls>
    </form>
  `,
})
class HostComponent {
  submitMethod = jest.fn().mockResolvedValue(undefined);
  allowResubmit = false;
  navigate: string[] | undefined = undefined;
  submitted: any[] = [];
  closed: any[] = [];
  controlsSubmitted: any[] = [];
  controls = viewChild.required(FormControlsComponent);
}

describe('FormControlsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let formDirective: FormDirective;
  const router = { navigate: jest.fn().mockResolvedValue(true) };

  async function setup(configure?: (host: HostComponent) => void, withRouter = true) {
    router.navigate.mockClear();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideNoopAnimations(),
        ...(withRouter ? [{ provide: Router, useValue: router }] : []),
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    configure?.(host);
    fixture.detectChanges();
    formDirective = fixture.debugElement.query(By.directive(FormDirective)).injector.get(FormDirective);
    return TestbedHarnessEnvironment.loader(fixture);
  }

  const flush = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('should create', async () => {
    await setup();
    expect(formDirective).toBeInstanceOf(FormDirective);
    expect(host.controls()).toBeTruthy();
  });

  it('should only trigger the submit logic once', async () => {
    const loader = await setup();
    const onSubmitSpy = jest.spyOn(formDirective, 'onSubmit').mockReturnValue(false);
    await (await loader.getHarness(MatButtonHarness.with({ text: /^Submit/ }))).click();
    expect(onSubmitSpy).toHaveBeenCalledTimes(1);
  });

  it('shows the invalid state and a snackbar for an invalid submit', async () => {
    const open = jest.spyOn(MatSnackBar.prototype, 'open').mockReturnValue(undefined as any);
    const loader = await setup();
    formDirective.form.get('name')!.setValue('');
    expect(formDirective.form.valid).toBe(false);
    await (await loader.getHarness(MatButtonHarness.with({ text: /^Submit/ }))).click();
    await flush();
    expect(host.controls().invalid()).toBe(true);
    expect(open).toHaveBeenCalled();
    expect(host.submitMethod).not.toHaveBeenCalled();
    expect(formDirective.form.touched).toBe(true);
  });

  it('submits a valid form and closes with the value', async () => {
    const loader = await setup();
    formDirective.form.get('name')!.setValue('x');
    await (await loader.getHarness(MatButtonHarness.with({ text: /^Submit/ }))).click();
    await flush();
    expect(host.submitMethod).toHaveBeenCalled();
    expect(host.controlsSubmitted).toHaveLength(1);
    expect(host.closed).toEqual([host.controlsSubmitted[0]]);
    expect(host.controls().invalid()).toBe(false);
  });

  it('allows resubmit without closing and keeps submitted values', async () => {
    const loader = await setup((h) => (h.allowResubmit = true));
    const reuse = jest.fn();
    (formDirective.formDefinition as any).rxapReuse = reuse;
    formDirective.form.get('name')!.setValue('x');
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }))).click();
    await flush();
    expect(host.closed).toEqual([]);
    expect(reuse).toHaveBeenCalled();
    formDirective.form.get('name')!.setValue('y');
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Submit and Close' }))).click();
    await flush();
    expect(host.closed).toHaveLength(1);
    expect(host.closed[0]).toHaveLength(2);
  });

  it('resets the form', async () => {
    const loader = await setup();
    formDirective.form.get('name')!.setValue('x');
    host.controls().invalid.set(true);
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Reset' }))).click();
    expect(host.controls().invalid()).toBe(false);
    expect(formDirective.form.get('name')!.value).toBeFalsy();
  });

  it('cancel emits close without value and navigates', async () => {
    const loader = await setup((h) => (h.navigate = ['/home']));
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    expect(host.closed).toEqual([undefined]);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('warns when navigating without a router', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const loader = await setup((h) => (h.navigate = ['/home']), false);
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('logs the current form state in dev mode', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const loader = await setup();
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Current Form State' }))).click();
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
