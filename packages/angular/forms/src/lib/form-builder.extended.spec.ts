import { Injectable, Injector } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { of } from 'rxjs';
import { ControlSetValue } from './decorators/control-set-value';
import { RxapForm } from './decorators/form';
import { UseFormArrayControl, UseFormArrayGroup } from './decorators/use-form-array';
import { UseFormControl } from './decorators/use-form-control';
import { UseFormGroup } from './decorators/use-form-group';
import { FormArrayControlManager, RxapFormBuilder } from './form-builder';
import { RxapFormArray } from './form-array';
import { RxapFormControl } from './form-control';
import { RxapFormGroup } from './form-group';
import { InjectableValidator } from './model';

@RxapForm('extended-contact')
class ContactForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public zip!: RxapFormControl<string>;
}

describe('FormArrayControlManager', () => {

  it('inserts and removes entries of the definition array', () => {
    const form: any = { items: [] };
    const manager = new FormArrayControlManager(form, 'items');

    manager.inserted(0, 'a' as any);
    manager.inserted(0, 'b' as any);
    expect(form.items).toEqual([ 'b', 'a' ]);

    manager.removed(0);
    expect(form.items).toEqual([ 'a' ]);
  });

  it('throws if the control id does not point to an array', () => {
    const manager = new FormArrayControlManager({ items: 'not an array' } as any, 'items');

    expect(() => manager.inserted(0, 'a' as any)).toThrow(/does not points to an array/);
    expect(() => manager.removed(0)).toThrow(/does not points to an array/);
  });

});

describe('RxapFormBuilder (extended)', () => {

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('definition', () => {

    it('throws if the form definition decorator is missing', () => {
      class Plain {
      }

      expect(() => new RxapFormBuilder(Plain as any)).toThrow('Ensure that the @UseForm decorator is used.');
    });

    it('throws if the definition instance can not be injected', () => {
      @RxapForm('failing-definition')
      class FailingForm {
        public rxapFormGroup!: RxapFormGroup;
      }

      const builder = new RxapFormBuilder(FailingForm as any, Injector.NULL, [
        {
          provide: FailingForm,
          useFactory: () => {
            throw new Error('boom');
          },
          deps: [],
        },
      ]);

      expect(() => builder.build()).toThrow('Could not inject the definition instance: boom');
    });

    it('calls the rxapOnInit hook after the form group was created', () => {
      let groupAtInit: RxapFormGroup | undefined;

      @RxapForm('on-init')
      class OnInitForm {
        public rxapFormGroup!: RxapFormGroup;
        public initialized = false;

        @UseFormControl()
        public name!: RxapFormControl;

        rxapOnInit() {
          this.initialized = true;
          groupAtInit = this.rxapFormGroup;
        }
      }

      const form = new RxapFormBuilder<any, any>(OnInitForm).build<any>();

      expect(form.initialized).toBe(true);
      expect(groupAtInit).toBe(form.rxapFormGroup);
      expect(form.rxapFormGroup.rxapFormDefinition).toBe(form);
    });

    it('calls the initial control set value callbacks with the initial control value', () => {
      const calls: Array<[ any, any ]> = [];

      @RxapForm('set-value')
      class SetValueForm {
        public rxapFormGroup!: RxapFormGroup;

        @UseFormControl()
        public name!: RxapFormControl;

        @UseFormControl()
        public other!: RxapFormControl;

        @ControlSetValue('name', { initial: true })
        onInitialName(value: any, options: any) {
          calls.push([ value, options ]);
        }

        @ControlSetValue('other')
        onOther(value: any, options: any) {
          calls.push([ value, options ]);
        }
      }

      const form = new RxapFormBuilder<any, any>(SetValueForm).build<any>({ name: 'abc', other: 'def' });

      expect(calls).toEqual([ [ 'abc', { initial: true } ] ]);

      form.other.setValue('changed');

      expect(calls[1]).toEqual([ 'changed', undefined ]);
    });

  });

  describe('control state', () => {

    @RxapForm('control-state')
    class ControlStateForm {
      public rxapFormGroup!: RxapFormGroup;

      @UseFormControl({ state: 'from options' })
      public fromOptions!: RxapFormControl;

      @UseFormControl({ state: () => 'from function' })
      public fromFunction!: RxapFormControl;

      @UseFormControl()
      public empty!: RxapFormControl;
    }

    it('uses the state of the decorator options', () => {
      const form = new RxapFormBuilder<any, any>(ControlStateForm).build<any>();

      expect(form.fromOptions.value).toBe('from options');
      expect(form.fromFunction.value).toBe('from function');
      expect(form.empty.value).toBeNull();
    });

    it('prefers the state passed to the build method', () => {
      const form = new RxapFormBuilder<any, any>(ControlStateForm).build<any>({
        fromOptions: 'from build',
        fromFunction: () => 'lazy build',
      });

      expect(form.fromOptions.value).toBe('from build');
      expect(form.fromFunction.value).toBe('lazy build');
    });

  });

  describe('group state', () => {

    const create = (state: any) => {
      @RxapForm('group-state')
      class GroupStateForm {
        public rxapFormGroup!: RxapFormGroup;

        @UseFormGroup(ContactForm, { state })
        public contact!: ContactForm;
      }

      return new RxapFormBuilder<any, any>(GroupStateForm).build<any>();
    };

    it('uses the state of the decorator options', () => {
      expect(create({ zip: '111' }).rxapFormGroup.value).toEqual({ contact: { zip: '111' } });
    });

    it('uses the object returned by a state function', () => {
      expect(create(() => ({ zip: '222' })).rxapFormGroup.value).toEqual({ contact: { zip: '222' } });
    });

    it('throws if the state function returns an empty value', () => {
      expect(() => create(() => null)).toThrow(/returns a empty value/);
    });

    it('throws if the state function returns a non object value', () => {
      expect(() => create(() => 'text')).toThrow(/returns a non object like value instead 'string'/);
    });

  });

  describe('array state', () => {

    const createGroups = (state: any) => {
      @RxapForm('array-group-state')
      class ArrayGroupStateForm {
        public rxapFormGroup!: RxapFormGroup;

        @UseFormArrayGroup(ContactForm, { state })
        public contacts!: any;
      }

      return new RxapFormBuilder<any, any>(ArrayGroupStateForm).build<any>();
    };

    const createControls = (state: any) => {
      @RxapForm('array-control-state')
      class ArrayControlStateForm {
        public rxapFormGroup!: RxapFormGroup;

        @UseFormArrayControl({ state })
        public tags!: any;
      }

      return new RxapFormBuilder<any, any>(ArrayControlStateForm).build<any>();
    };

    it('uses the array state of the decorator options', () => {
      expect(createGroups([ { zip: '1' }, { zip: '2' } ]).rxapFormGroup.value)
        .toEqual({ contacts: [ { zip: '1' }, { zip: '2' } ] });
      expect(createControls([ 'a', 'b' ]).rxapFormGroup.value).toEqual({ tags: [ 'a', 'b' ] });
    });

    it('ignores a state function of the decorator options for arrays', () => {
      expect(createGroups(() => [ { zip: '3' } ]).rxapFormGroup.value).toEqual({ contacts: [] });
      expect(createControls(() => [ 'x' ]).rxapFormGroup.value).toEqual({ tags: [] });
    });

    describe('coerceToArrayFormState', () => {

      const coerce = (...args: any[]) => {
        const builder: any = new RxapFormBuilder<any, any>(ContactForm as any);
        return builder.coerceToArrayFormState(...args);
      };

      it('prefers the array of the build state over the options state', () => {
        expect(coerce('c', [], { c: [ 1 ] }, [ 2 ])).toEqual([ 1 ]);
        expect(coerce('c', [], {}, [ 2 ])).toEqual([ 2 ]);
        expect(coerce('c', [ 3 ], {}, undefined)).toEqual([ 3 ]);
      });

      it('calls a default state function', () => {
        expect(coerce('c', () => [ 4 ], {})).toEqual([ 4 ]);
      });

      it('throws if the default state function returns an empty value', () => {
        expect(() => coerce('c', () => null, {})).toThrow(/returns a empty value/);
      });

      it('throws if the default state function returns a non array value', () => {
        expect(() => coerce('c', () => ({}), {})).toThrow(/returns a non array like value instead 'object'/);
      });

    });

    it('inserts a new control to an array of controls with the builder of the array', () => {
      const form: any = createControls([ 'a' ]);
      const array: RxapFormArray = form.tags.rxapFormArray;

      array.insertAt(undefined, 'b');

      expect(array.value).toEqual([ 'a', 'b' ]);
      expect(form.tags.length).toBe(2);
      expect(form.tags[1]).toBeInstanceOf(RxapFormControl);
      expect(array.at(1).parent).toBe(array);
    });

  });

  describe('injectable validators', () => {

    @Injectable()
    class NotEmptyValidator implements InjectableValidator {
      validate: ValidatorFn = (control) => control.value ? null : { empty: true };
    }

    @Injectable()
    class OkAsyncValidator implements InjectableValidator {
      asyncValidate = (control: any) => of(control.value === 'ok' ? null : { notOk: true });
    }

    @RxapForm('inject-validators')
    class InjectValidatorsForm {
      public rxapFormGroup!: RxapFormGroup;

      @UseFormControl({ injectValidators: [ NotEmptyValidator, OkAsyncValidator ] })
      public name!: RxapFormControl;
    }

    it('applies the validate and asyncValidate methods of the injected validators', () => {
      const injector = Injector.create({
        providers: [
          { provide: NotEmptyValidator, useClass: NotEmptyValidator, deps: [] },
          { provide: OkAsyncValidator, useClass: OkAsyncValidator, deps: [] },
        ],
      });

      const form = new RxapFormBuilder<any, any>(InjectValidatorsForm, injector).build<any>({ name: 'ok' });

      expect(form.name.errors).toBeNull();
      form.name.setValue('');
      expect(form.name.errors).toEqual({ empty: true });
      form.name.setValue('other');
      expect(form.name.errors).toEqual({ notOk: true });
    });

  });

});
