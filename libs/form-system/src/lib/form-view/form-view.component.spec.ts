import { TestBed } from '@angular/core/testing';
import { FormViewComponent } from './form-view.component';
import { FormTemplateLoader } from '../form-template-loader';
import { FormInstanceFactory } from '../form-instance-factory';
import { Layout } from './layout';
import { FormInstance } from '../form-instance';

describe('Form System', () => {

  describe('Form View', () => {

    describe('FormViewComponent', () => {

      let component: FormViewComponent<any>;
      let formInstnace: FormInstance<any>;
      const formId = 'FORM_ID';

      beforeAll((() => {

        TestBed.configureTestingModule({});

        const formTemplateLoader  = TestBed.get(FormTemplateLoader);
        const formInstanceFactory = TestBed.get(FormInstanceFactory);

        component = new FormViewComponent<any>(
          formTemplateLoader,
          formInstanceFactory
        );

        formInstnace = FormInstance.TestInstance();

        spyOn(component.formInstanceFactory, 'buildInstance')
          .and
          .returnValue(formInstnace);

        spyOn(component.formTemplateLoader, 'getLayout')
          .and
          .returnValue(new Layout());

        component.formId = formId;

      }));

      it('should call rxapOnInit for the current form instance when ngOnInit is called', () => {

        const instanceOnInitSpy = spyOn(formInstnace, 'rxapOnInit');

        component.ngOnInit();

        expect(instanceOnInitSpy.calls.count()).toBe(1);

      });

      it('should call clickSubmitButton if an clickSubmit$ event is triggered', () => {

        const clickSubmitButtonSpy = spyOn(component, 'clickSubmitButton');

        formInstnace.clickSubmit$.next();

        expect(clickSubmitButtonSpy.calls.count()).toBe(1);

      });

      it('should call clickResetButton if an clickSubmit$ event is triggered', () => {

        const clickResetButtonSpy = spyOn(component, 'clickResetButton');

        formInstnace.clickReset$.next();

        expect(clickResetButtonSpy.calls.count()).toBe(1);

      });

      it('should call rxapOnDestroy for the current form instance when ngOnDestroy is called', () => {

        const instanceOnDestroy = spyOn(formInstnace, 'rxapOnDestroy');

        component.ngOnInit();

        expect(component.subscriptions.closed).toBe(false);

        component.ngOnDestroy();

        expect(instanceOnDestroy.calls.count()).toBe(1);
        expect(component.subscriptions.closed).toBe(true);

      })

    });

  });

});
