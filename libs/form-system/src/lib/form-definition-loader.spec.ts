import { TestBed } from '@angular/core/testing';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';
import { FormDefinitionLoader } from './form-definition-loader';
import { RxapFormDefinition } from './form-definition/form-definition';
import { RxapFormControl } from './form-definition/decorators/control';
import { BaseFormControl } from './forms/form-controls/base.form-control';
import { RxapForm } from './form-definition/decorators/form-definition';

describe('Form System', () => {

  describe('FormDefinitionLoader', () => {

    let fdl: FormDefinitionLoader;

    beforeEach(() => {
      fdl = TestBed.get(FormDefinitionLoader);
    });

    const FORM_ID = 'form';

    @RxapForm(FORM_ID)
    @Injectable({ providedIn: 'root' })
    class FormDefinition extends RxapFormDefinition<any> {

      @RxapFormControl()
      username!: BaseFormControl<string>;

    }

    it('should set group property while form definition loading', () => {

      const formDefinition = fdl.load(FormDefinition);

      expect(formDefinition.group).toBeDefined();
      expect(formDefinition.group).toBeInstanceOf(BaseFormGroup);

    });

    it('should add all controls to from definition group', () => {

      const formDefinition = fdl.load(FormDefinition);

      expect(formDefinition.group.controls.size).toBe(1);

      expect(formDefinition.group.controls.get('username')).toBeDefined();

    })

  })

});
