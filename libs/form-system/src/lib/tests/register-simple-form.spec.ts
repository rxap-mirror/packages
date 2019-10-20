import { TestBed } from '@angular/core/testing';
import { FormDefinitionRegister } from '../form-definition-register';
import { RxapForm } from '../form-definition/decorators/form-definition';
import { FormDefinitionLoader } from '../form-definition-loader';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { FormInstanceFactory } from '../form-instance-factory';
import { FormTemplateLoader } from '../form-template-loader';
import { RxapFormTemplate } from '../form-definition/decorators/form-template';
import { RxapFormDefinition } from '../form-definition/form-definition';
import { RxapFormControl } from '../form-definition/decorators/control';
import { RxapFormSystemModule } from '../form-system.module';

describe('E2E', () => {

  describe('Register Simple Form', () => {

    const FORM_ID = 'user-profile';
    let fdr: FormDefinitionRegister;
    let fdl: FormDefinitionLoader;
    let fif: FormInstanceFactory;
    let ftl: FormTemplateLoader;
    const template = `<control id="username" />`;

    interface UserProfileForm {
      username: string;
      firstname: string;
      lastname: string;
      birthDate: number;
      age: number;
    }

    @RxapFormTemplate(template)
    @RxapForm(FORM_ID)
    class UserProfileFormDefinition
      extends RxapFormDefinition<UserProfileForm> {

      @RxapFormControl()
      public username: BaseFormControl<string>;

    }

    beforeAll(() => {

      TestBed.configureTestingModule({
        imports: [
          RxapFormSystemModule.forRoot([ UserProfileFormDefinition]),
        ]
      });

      fdr = TestBed.get(FormDefinitionRegister);
      fdl = TestBed.get(FormDefinitionLoader);
      fif = TestBed.get(FormInstanceFactory);
      ftl = TestBed.get(FormTemplateLoader);

    });

    it('should register form definition', () => {
      expect(fdr.has(FORM_ID)).toBeTruthy();
      expect(fdr.formDefinitions.size).toBe(1);
    });

    it('should load form definition by id', () => {

      const formDefinition = fdl.load<UserProfileFormDefinition>(FORM_ID);

      expect(formDefinition).toBeDefined();

      expect(formDefinition.username).toBeDefined();

    });

    it('should create form instance', () => {

      const formInstance = fif.buildInstance(FORM_ID);

      expect(formInstance).toBeDefined();

    });

    it('should load form template by id', () => {

      expect(ftl.getTemplate(FORM_ID)).toBe(template);

    })

  })

});
