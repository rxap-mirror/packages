import { outputToObservable } from '@angular/core/rxjs-interop';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  DebugElement,
  Injector,
  INJECTOR,
  Provider,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RxapForm } from '../decorators/form';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormDefinition, FormType } from '../model';
import { FormDirective } from './form.directive';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_SUBMIT_METHOD,
} from './tokens';

@Component({
  standalone: true,
  imports: [FormDirective],
  template: `<form rxapForm><button type="submit">Button</button></form>`,
})
class HostComponent {}

describe('@rxap/forms', () => {
  describe('directives', () => {
    describe('FormDirective', () => {
      interface ITestForm {
        username: string;
        password: string;
      }

      @RxapForm('test')
      class TestForm implements FormType<ITestForm> {
        public rxapFormGroup!: RxapFormGroup;

        @UseFormControl()
        public username!: RxapFormControl;

        @UseFormControl()
        public password!: RxapFormControl;
      }

      const TestFormProviders: Provider[] = [
        TestForm,
        {
          provide: RXAP_FORM_DEFINITION_BUILDER,
          useFactory: (injector: Injector) =>
            new RxapFormBuilder<ITestForm>(TestForm, injector),
          deps: [INJECTOR],
        },
        {
          provide: RXAP_FORM_DEFINITION,
          useFactory: (builder: RxapFormBuilder) => builder.build(),
          deps: [RXAP_FORM_DEFINITION_BUILDER],
        },
        {
          provide: ChangeDetectorRef,
          useValue: {
            detectChanges: () => {},
          },
        },
      ];

      // The directive injects the method tokens with skipSelf. Create it in a
      // child injector so the tokens provided by the TestBed are visible.
      const createDirective = (): FormDirective =>
        Injector.create({
          parent: TestBed.inject(Injector),
          providers: [FormDirective],
        }).get(FormDirective);

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should create a form definition instance', () => {
        TestBed.configureTestingModule({
          providers: [TestFormProviders],
        });

        const formDirective = createDirective();
        const formDefinition: FormDefinition =
          TestBed.inject(RXAP_FORM_DEFINITION);

        expect(formDirective.form).toBeInstanceOf(RxapFormGroup);
        expect(formDefinition.rxapFormGroup).toBe(formDirective.form);
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });
      });

      it('should set loaded to true if no load method is defined', () => {
        TestBed.configureTestingModule({
          providers: [TestFormProviders],
        });
        const formDirective = createDirective();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        formDirective.ngOnInit();
        expect(formDirective.loaded()).toBeTruthy();
        expect(formDirective.loading()).toBeFalsy();
      });

      it('should call the load method(sync)', () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_LOAD_METHOD,
              useValue: {
                call() {
                  return {
                    username: 'rxap',
                    password: 'paxr',
                  };
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();
        expect(formDirective.loaded()).toBeTruthy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.loadingError()).toBeNull();
        expect(formDirective.value).toEqual({
          username: 'rxap',
          password: 'paxr',
        });
      });

      it('should call the load method(sync) with error', () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_LOAD_METHOD,
              useValue: {
                call() {
                  throw new Error('failed');
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.loadingError()).toEqual(new Error('failed'));
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });
      });

      it('should call the load method(async)', async () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_LOAD_METHOD,
              useValue: {
                call() {
                  return Promise.resolve({
                    username: 'rxap',
                    password: 'paxr',
                  });
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();

        expect(formDirective.loading()).toBeTruthy();

        await TestBed.inject(ApplicationRef).whenStable();

        expect(formDirective.loaded()).toBeTruthy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.loadingError()).toBeNull();
        expect(formDirective.value).toEqual({
          username: 'rxap',
          password: 'paxr',
        });
      });

      it('should call the load method(async) with error', async () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_LOAD_METHOD,
              useValue: {
                call() {
                  return Promise.reject(new Error('failed'));
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();

        expect(formDirective.loading()).toBeTruthy();

        await TestBed.inject(ApplicationRef).whenStable();

        expect(formDirective.loaded()).toBeFalsy();
        expect(formDirective.loading()).toBeFalsy();
        expect(formDirective.loadingError()).toEqual(new Error('failed'));
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });
      });

      it('should call the submit method(sync)', () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_SUBMIT_METHOD,
              useValue: {
                call(value: any) {
                  return value;
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        formDirective.form.setValue({
          username: 'rxap',
          password: 'paxr',
        });

        const rxapSubmitSpy = jest.fn();

        outputToObservable(formDirective.rxapSubmit).subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(rxapSubmitSpy).toHaveBeenCalled();
        expect(rxapSubmitSpy).toHaveBeenCalledWith({
          username: 'rxap',
          password: 'paxr',
        });
        expect(formDirective.submitted).toBeTruthy();
        expect(formDirective.submitting()).toBeFalsy();
        expect(formDirective.submitError()).toBeNull();
      });

      it('should call the submit method(sync) with error', () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_SUBMIT_METHOD,
              useValue: {
                call(value: any) {
                  throw new Error('failed');
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        formDirective.form.setValue({
          username: 'rxap',
          password: 'paxr',
        });

        const rxapSubmitSpy = jest.fn();

        outputToObservable(formDirective.rxapSubmit).subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(rxapSubmitSpy).not.toHaveBeenCalled();
        expect(formDirective.submitted).toBeFalsy();
        expect(formDirective.submitting()).toBeFalsy();
        expect(formDirective.submitError()).toEqual(new Error('failed'));
      });

      it('should call the submit method(async)', async () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_SUBMIT_METHOD,
              useValue: {
                call(value: any) {
                  return Promise.resolve(value);
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        formDirective.form.setValue({
          username: 'rxap',
          password: 'paxr',
        });

        const rxapSubmitSpy = jest.fn();

        outputToObservable(formDirective.rxapSubmit).subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(formDirective.submitting()).toBeTruthy();

        await TestBed.inject(ApplicationRef).whenStable();

        expect(rxapSubmitSpy).toHaveBeenCalled();
        expect(rxapSubmitSpy).toHaveBeenCalledWith({
          username: 'rxap',
          password: 'paxr',
        });
        expect(formDirective.submitted).toBeTruthy();
        expect(formDirective.submitting()).toBeFalsy();
        expect(formDirective.submitError()).toBeNull();
      });

      it('should call the submit method(async) with error', async () => {
        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
            FormDirective,
            {
              provide: RXAP_FORM_SUBMIT_METHOD,
              useValue: {
                call(value: any) {
                  return Promise.reject(new Error('failed'));
                },
              },
            },
          ],
        });

        const formDirective = createDirective();
        formDirective.form.setValue({
          username: 'rxap',
          password: 'paxr',
        });

        const rxapSubmitSpy = jest.fn();

        outputToObservable(formDirective.rxapSubmit).subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(formDirective.submitting()).toBeTruthy();

        await TestBed.inject(ApplicationRef).whenStable();

        expect(rxapSubmitSpy).not.toHaveBeenCalled();
        expect(formDirective.submitted).toBeFalsy();
        expect(formDirective.submitting()).toBeFalsy();
        expect(formDirective.submitError()).toEqual(new Error('failed'));
      });

      it('should auto submit', async () => {
        jest.useFakeTimers();
        interface ITestAutoSubmit {
          username: string;
          password: string;
        }

        @RxapForm({
          id: 'test-auto-submit',
          autoSubmit: true,
        })
        class TestAutoSubmit implements FormType<ITestAutoSubmit> {
          public rxapFormGroup!: RxapFormGroup;

          @UseFormControl()
          public username!: RxapFormControl;

          @UseFormControl()
          public password!: RxapFormControl;
        }

        TestBed.configureTestingModule({
          providers: [
            TestAutoSubmit,
            {
              provide: RXAP_FORM_DEFINITION_BUILDER,
              useFactory: (injector: Injector) =>
                new RxapFormBuilder<ITestAutoSubmit>(TestAutoSubmit, injector),
              deps: [INJECTOR],
            },
            {
              provide: RXAP_FORM_DEFINITION,
              useFactory: (builder: RxapFormBuilder) => builder.build(),
              deps: [RXAP_FORM_DEFINITION_BUILDER],
            },
            {
              provide: ChangeDetectorRef,
              useValue: {
                detectChanges: () => {},
              },
            },
          ],
        });

        const formDirective = createDirective();
        formDirective.ngOnInit();

        const submitSpy = jest.spyOn(formDirective, 'submit' as any);

        expect(formDirective.formDefinition).toHaveProperty('rxapMetadata');
        expect(formDirective.formDefinition.rxapMetadata).toHaveProperty(
          'autoSubmit',
          true,
        );

        formDirective.form.setValue({
          username: 'rxap',
          password: 'paxr',
        });

        expect(submitSpy).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(5000);

        expect(submitSpy).toHaveBeenCalled();
      });

      describe('With Component', () => {
        let fixture: ComponentFixture<HostComponent>;
        let submitButton: DebugElement;
        let formDirective: FormDirective;

        beforeEach(async () => {
          await TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [TestFormProviders],
          });

          fixture = TestBed.createComponent(HostComponent);
          fixture.detectChanges();

          submitButton = fixture.debugElement.query(By.css('button'));
          formDirective = fixture.debugElement
            .query(By.directive(FormDirective))
            .injector.get(FormDirective);
        });

        it('should create', () => {
          expect(formDirective).toBeDefined();
          expect(formDirective).toBeInstanceOf(FormDirective);
          expect(submitButton).toBeDefined();
          expect(submitButton.name).toBe('button');
        });

        it('should only trigger the submit logic once', async () => {
          const onSubmitSpy = jest.spyOn(formDirective, 'onSubmit');

          submitButton.nativeElement.click();

          await fixture.whenStable();

          expect(onSubmitSpy).toHaveBeenCalled();
          expect(onSubmitSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
