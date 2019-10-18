import {
  FormDefinitionLoader,
  RxapFormDefinition,
  RxapFormControl
} from '@rxap/form-system';
import { TestBed } from '@angular/core/testing';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';

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
        user;

      }

      const formDefinition = fdl.load(FormDefinition);

      expect(formDefinition.group.controls.size).toBe(1);

      expect(formDefinition.group.controls.get('user')).toBeDefined();

    })

  })

});
