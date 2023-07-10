import {FormDirective} from './form.directive';
import {FormDefinition, FormType} from '../model';
import {RxapForm} from '../decorators/form';
import {RxapFormGroup} from '../form-group';
import {RxapFormControl} from '../form-control';
import {
  TestBed,
  fakeAsync,
  tick,
  ComponentFixture,
} from '@angular/core/testing';
import {
  Provider,
  Injector,
  INJECTOR,
  ChangeDetectorRef,
  DebugElement,
} from '@angular/core';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_SUBMIT_METHOD,
} from './tokens';
import {UseFormControl} from '../decorators/use-form-control';
import {RxapFormBuilder} from '../form-builder';
import {
  MockedComponent,
  MockRender,
} from 'ng-mocks';
import {By} from '@angular/platform-browser';
import {RxapFormsModule} from './forms.module';

describe('@rxap/forms', () => {
  describe('directives', () => {
    xdescribe('FormDirective', () => {

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
            detectChanges: () => {
            },
          },
        },
      ];

      it('should create a form definition instance', () => {
        TestBed.configureTestingModule({
          providers: [TestFormProviders, FormDirective],
        });

        const formDirective = TestBed.inject(FormDirective);
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
          providers: [TestFormProviders, FormDirective],
        });
        const formDirective = TestBed.inject(FormDirective);
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        formDirective.ngOnInit();
        expect(formDirective.loaded).toBeTruthy();
        expect(formDirective.loading).toBeFalsy();
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
                  return {username: 'rxap', password: 'paxr'};
                },
              },
            },
          ],
        });

        const formDirective = TestBed.inject(FormDirective);
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();
        expect(formDirective.loaded).toBeTruthy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.loadingError).toBeNull();
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

        const formDirective = TestBed.inject(FormDirective);
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.loadingError).toEqual(new Error('failed'));
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });
      });

      it('should call the load method(async)', fakeAsync(() => {
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

        const formDirective = TestBed.inject(FormDirective);
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();

        expect(formDirective.loading).toBeTruthy();

        tick();

        expect(formDirective.loaded).toBeTruthy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.loadingError).toBeNull();
        expect(formDirective.value).toEqual({
          username: 'rxap',
          password: 'paxr',
        });
      }));

      it('should call the load method(async) with error', fakeAsync(() => {
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

        const formDirective = TestBed.inject(FormDirective);
        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });

        formDirective.ngOnInit();

        expect(formDirective.loading).toBeTruthy();

        tick();

        expect(formDirective.loaded).toBeFalsy();
        expect(formDirective.loading).toBeFalsy();
        expect(formDirective.loadingError).toEqual(new Error('failed'));
        expect(formDirective.value).toEqual({
          username: null,
          password: null,
        });
      }));

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

        const formDirective = TestBed.inject(FormDirective);
        formDirective.form.setValue({username: 'rxap', password: 'paxr'});

        const rxapSubmitSpy = jest.fn();

        formDirective.rxapSubmit.subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(rxapSubmitSpy).toBeCalled();
        expect(rxapSubmitSpy).toBeCalledWith({
          username: 'rxap',
          password: 'paxr',
        });
        expect(formDirective.submitted).toBeTruthy();
        expect(formDirective.submitting).toBeFalsy();
        expect(formDirective.submitError).toBeNull();
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

        const formDirective = TestBed.inject(FormDirective);
        formDirective.form.setValue({username: 'rxap', password: 'paxr'});

        const rxapSubmitSpy = jest.fn();

        formDirective.rxapSubmit.subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(rxapSubmitSpy).not.toBeCalled();
        expect(formDirective.submitted).toBeFalsy();
        expect(formDirective.submitting).toBeFalsy();
        expect(formDirective.submitError).toEqual(new Error('failed'));
      });

      it('should call the submit method(async)', fakeAsync(() => {
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

        const formDirective = TestBed.inject(FormDirective);
        formDirective.form.setValue({username: 'rxap', password: 'paxr'});

        const rxapSubmitSpy = jest.fn();

        formDirective.rxapSubmit.subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(formDirective.submitting).toBeTruthy();

        tick();

        expect(rxapSubmitSpy).toBeCalled();
        expect(rxapSubmitSpy).toBeCalledWith({
          username: 'rxap',
          password: 'paxr',
        });
        expect(formDirective.submitted).toBeTruthy();
        expect(formDirective.submitting).toBeFalsy();
        expect(formDirective.submitError).toBeNull();
      }));

      it('should call the submit method(async) with error', fakeAsync(() => {
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

        const formDirective = TestBed.inject(FormDirective);
        formDirective.form.setValue({username: 'rxap', password: 'paxr'});

        const rxapSubmitSpy = jest.fn();

        formDirective.rxapSubmit.subscribe(rxapSubmitSpy);

        formDirective.onSubmit(new Event('submit'));

        expect(formDirective.submitting).toBeTruthy();

        tick();

        expect(rxapSubmitSpy).not.toBeCalled();
        expect(formDirective.submitted).toBeFalsy();
        expect(formDirective.submitting).toBeFalsy();
        expect(formDirective.submitError).toEqual(new Error('failed'));
      }));

      it('should auto submit', fakeAsync(() => {

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
                detectChanges: () => {
                },
              },
            },
            FormDirective,
          ],
        });

        const formDirective = TestBed.inject(FormDirective);
        formDirective.ngOnInit();

        const submitSpy = jest.spyOn(formDirective, 'submit' as any);

        expect(formDirective.formDefinition).toHaveProperty('rxapMetadata');
        expect(formDirective.formDefinition.rxapMetadata).toHaveProperty(
          'autoSubmit',
          true,
        );

        formDirective.form.setValue({username: 'rxap', password: 'paxr'});

        expect(submitSpy).not.toBeCalled();

        tick(5000);

        expect(submitSpy).toBeCalled();
      }));

      describe('With Component', () => {
        let fixture: ComponentFixture<MockedComponent<any>>;
        let submitButton: DebugElement;
        let formDirective: FormDirective;

        beforeEach(async () => {
          await TestBed.configureTestingModule({
            imports: [RxapFormsModule],
            providers: [TestFormProviders],
          });

          fixture = MockRender(`
          <form rxapForm>
          <button type="submit">Button</button>
          </form>
          `);

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

          expect(onSubmitSpy).toBeCalled();
          expect(onSubmitSpy).toBeCalledTimes(1);
        });
      });
    });
  });
});
