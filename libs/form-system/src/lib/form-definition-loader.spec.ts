import { TestBed } from '@angular/core/testing';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';
import { FormDefinitionLoader } from './form-definition-loader';
import { RxapFormDefinition } from './form-definition/form-definition';
import { RxapFormControl } from './form-definition/decorators/control';
import { BaseFormControl } from './forms/form-controls/base.form-control';

describe('Form System', () => {

  describe('FormDefinitionLoader', () => {

    let fdl: FormDefinitionLoader;

    beforeEach(() => {
      fdl = TestBed.get(FormDefinitionLoader);
    });

    it('should set group property while form definition loading', () => {

      const formDefinition = fdl.load(RxapFormDefinition);

      expect(formDefinition.group).toBeDefined();
      expect(formDefinition.group).toBeInstanceOf(BaseFormGroup);

    });

    it('should add all controls to from definition group', () => {

      @Injectable({ providedIn: 'root' })
      class FormDefinition extends RxapFormDefinition<any> {

        @RxapFormControl()
        username!: BaseFormControl<string>;

      }

      const formDefinition = fdl.load(FormDefinition);

      expect(formDefinition.group.controls.size).toBe(1);

      expect(formDefinition.group.controls.get('username')).toBeDefined();

    })

  })

});
