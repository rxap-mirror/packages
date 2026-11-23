import {
  callRule,
  HostTree,
} from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { lastValueFrom } from 'rxjs';
import { Project } from 'ts-morph';
import { AbstractControl } from '../types/abstract-control';

jest.mock('../ts-morph-transform', () => ({
  TsMorphAngularProjectTransformRule: (_o: any, cb: any, filePaths?: string[]) => () => {
    const project = (globalThis as any).__project;
    const files = filePaths?.map(f => {
      const p = f.replace(/\?$/, '');
      return project.getSourceFile(p) ?? project.createSourceFile(p, '');
    });
    return cb(project, files, _o);
  },
}));

import { CoerceFormDefinition } from './coerce-form-definition';
import {
  CoerceFormArray,
  CoerceFormDefinitionFormArray,
  CoerceInterfaceFormTypeArray,
  GetFormArrayNameFromFormDefinitionName,
} from './coerce-form-definition-array';
import {
  CoerceFormDefinitionControl,
  FormControlStateCodeBlockWriter,
  FormControlValidatorCodeBlockWriter,
  isAngularValidator,
} from './coerce-form-definition-control';
import {
  CoerceFormControl,
  CoerceFormDefinitionFormControl,
  CoerceInterfaceFormTypeControl,
} from './coerce-form-definition-form-control';
import {
  CoerceFormDefinitionFormGroup,
  CoerceFormGroup,
  CoerceInterfaceFormTypeGroup,
  GetFormGroupNameFromFormDefinitionName,
} from './coerce-form-definition-group';
import {
  CoerceFormDefinitionTypeRule,
  CoerceInterfaceFormType,
} from './coerce-form-definition-type';

function control(partial: Partial<AbstractControl> & { name: string }): AbstractControl {
  return {
    type: { name: 'string' },
    isArray: false,
    isOptional: false,
    state: null,
    isRequired: false,
    validatorList: [],
    role: 'control',
    ...partial,
  } as AbstractControl;
}

describe('form definition generation', () => {

  let project: Project;
  const exec = (rule: any) => lastValueFrom(callRule(rule, new HostTree(), { logger: { info: jest.fn() } } as any));

  beforeEach(() => {
    project = CreateProject();
    (globalThis as any).__project = project;
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  describe('isAngularValidator', () => {
    it.each([ 'required', 'requiredTrue', 'email', 'nullValidator', 'min(1)', 'max(10)', 'minLength(3)', 'maxLength(4)', 'pattern(/a/)' ])(
      'should detect %s as angular validator', (validator) => {
        expect(isAngularValidator(validator)).toBe(true);
      });
    it.each([ 'url', 'min', 'custom(1)', 'Required' ])('should not detect %s as angular validator', (validator) => {
      expect(isAngularValidator(validator)).toBe(false);
    });
  });

  describe('FormControlValidatorCodeBlockWriter', () => {
    const write = (c: Pick<AbstractControl, 'validatorList' | 'isRequired'>) => {
      const sourceFile = project.createSourceFile('t.ts', '');
      sourceFile.addVariableStatement({
        declarations: [ { name: 'v', initializer: FormControlValidatorCodeBlockWriter(sourceFile, c) } ],
      });
      return sourceFile;
    };

    it('should write an empty array without validators', () => {
      const sourceFile = write({ validatorList: [], isRequired: false });
      expect(sourceFile.getText()).toContain('let v = [];');
      expect(sourceFile.getImportDeclarations()).toHaveLength(0);
    });

    it('should write only Validators.required for a required control', () => {
      const sourceFile = write({ validatorList: [], isRequired: true });
      expect(sourceFile.getText()).toMatch(/let v = \[\s*Validators\.required\s*\]/);
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@angular/forms');
    });

    it('should prefix angular validators with Validators and others with RxapValidators', () => {
      const sourceFile = write({ validatorList: [ 'email', 'url' ], isRequired: true });
      const text = sourceFile.getText();
      expect(text).toContain('Validators.email,');
      expect(text).toContain('RxapValidators.url,');
      expect(text).toContain('Validators.required');
      const modules = sourceFile.getImportDeclarations().map(i => i.getModuleSpecifierValue());
      expect(modules).toEqual(expect.arrayContaining([ '@angular/forms', '@rxap/forms' ]));
    });

    it('should write a single validator inline', () => {
      const sourceFile = write({ validatorList: [ 'email' ], isRequired: false });
      expect(sourceFile.getText()).toContain('let v = [Validators.email];');
    });
  });

  describe('FormControlStateCodeBlockWriter', () => {
    const write = (state: any) => {
      const sourceFile = project.createSourceFile('t.ts', '');
      sourceFile.addVariableStatement({
        declarations: [ { name: 'v', initializer: FormControlStateCodeBlockWriter(sourceFile, { state }) } ],
      });
      return sourceFile.getText();
    };

    it('should write a string state', () => {
      expect(write('\'abc\'')).toContain('let v = \'abc\';');
    });

    it('should call a writer function state', () => {
      expect(write((w: any) => w.write('42'))).toContain('let v = 42;');
    });

    it('should throw for an invalid state', () => {
      expect(() => write(5)).toThrow('Invalid state type');
    });
  });

  describe('CoerceInterfaceFormTypeControl', () => {
    it('should add an interface with the control property', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'TestForm' });
      CoerceInterfaceFormTypeControl(sourceFile, classDeclaration, 'ITestForm', control({ name: 'first-name' }));
      const interfaceDeclaration = sourceFile.getInterfaceOrThrow('ITestForm');
      expect(interfaceDeclaration.isExported()).toBe(true);
      expect(interfaceDeclaration.getPropertyOrThrow('firstName').getType().getText()).toBe('string');
    });

    it('should skip if a type alias with the name exists', () => {
      const sourceFile = project.createSourceFile('t.ts', 'export type ITestForm = {};');
      const classDeclaration = sourceFile.addClass({ name: 'TestForm' });
      CoerceInterfaceFormTypeControl(sourceFile, classDeclaration, 'ITestForm', control({ name: 'a' }));
      expect(sourceFile.getInterface('ITestForm')).toBeUndefined();
    });
  });

  describe('CoerceFormControl', () => {
    const setup = () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'TestForm' });
      return { sourceFile, classDeclaration };
    };

    it('should add a plain control property with decorator and imports', () => {
      const { sourceFile, classDeclaration } = setup();
      const { propertyDeclaration, decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({ name: 'name' }));
      expect(propertyDeclaration.getName()).toBe('name');
      expect(propertyDeclaration.isReadonly()).toBe(true);
      expect(propertyDeclaration.hasExclamationToken()).toBe(true);
      expect(propertyDeclaration.getTypeNode()!.getText()).toBe('RxapFormControl<string>');
      expect(decoratorDeclaration.getName()).toBe('UseFormControl');
      expect(decoratorDeclaration.getArguments()).toHaveLength(0);
      const forms = sourceFile.getImportDeclarationOrThrow('@rxap/forms');
      expect(forms.getNamedImports().map(i => i.getName())).toEqual(expect.arrayContaining([ 'RxapFormControl', 'UseFormControl' ]));
    });

    it('should add validators and state to the decorator', () => {
      const { sourceFile, classDeclaration } = setup();
      const { decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({
        name: 'name', isRequired: true, state: '\'x\'',
      }));
      const text = decoratorDeclaration.getText();
      expect(text).toContain('validators: [Validators.required]');
      expect(text).toContain('state: \'x\'');
    });

    it('should use an empty array state for array controls', () => {
      const { sourceFile, classDeclaration } = setup();
      const { decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({
        name: 'tags', isArray: true,
      }));
      expect(decoratorDeclaration.getText()).toContain('state: []');
    });

    it('should extend an existing decorator argument object and replace the state', () => {
      const { sourceFile, classDeclaration } = setup();
      classDeclaration.addProperty({
        name: 'name',
        decorators: [ { name: 'UseFormControl', arguments: [ '{ state: \'old\' }' ] } ],
      });
      const { decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({
        name: 'name', isRequired: true, state: '\'new\'',
      }));
      const text = decoratorDeclaration.getText();
      expect(text).toContain('state: \'new\'');
      expect(text).not.toContain('old');
      expect(text).toContain('validators: [Validators.required]');
    });

    it('should not overwrite existing validators', () => {
      const { sourceFile, classDeclaration } = setup();
      classDeclaration.addProperty({
        name: 'name',
        decorators: [ { name: 'UseFormControl', arguments: [ '{ validators: [Validators.email] }' ] } ],
      });
      const { decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({
        name: 'name', isRequired: true,
      }));
      expect(decoratorDeclaration.getText()).toContain('validators: [Validators.email]');
      expect(decoratorDeclaration.getText()).not.toContain('required');
    });

    it('should add state to an existing decorator argument object without state', () => {
      const { sourceFile, classDeclaration } = setup();
      classDeclaration.addProperty({
        name: 'name',
        decorators: [ { name: 'UseFormControl', arguments: [ '{}' ] } ],
      });
      const { decoratorDeclaration } = CoerceFormControl(sourceFile, classDeclaration, 'ITestForm', control({
        name: 'name', state: '1',
      }));
      expect(decoratorDeclaration.getText()).toContain('state: 1');
    });
  });

  describe('CoerceFormGroup', () => {
    it('should add a group property referencing the nested form definition', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      const { propertyDeclaration, decoratorDeclaration } = CoerceFormGroup(
        sourceFile, classDeclaration, 'IUserForm', control({ name: 'address', role: 'group', isRequired: true }),
      );
      expect(GetFormGroupNameFromFormDefinitionName('UserForm', 'address')).toBe('User-address');
      expect(propertyDeclaration.getName()).toBe('address');
      expect(propertyDeclaration.getTypeNode()!.getText()).toBe('UserAddressForm');
      expect(decoratorDeclaration.getName()).toBe('UseFormGroup');
      expect(decoratorDeclaration.getArguments()[0].getText()).toBe('UserAddressForm');
      expect(decoratorDeclaration.getArguments()[1].getText()).toContain('validators');
      const imp = sourceFile.getImportDeclarationOrThrow('./user-address.form');
      expect(imp.getNamedImports().map(i => i.getName())).toEqual([ 'IUserAddressForm', 'UserAddressForm' ]);
    });

    it('should add the group to the interface', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormTypeGroup(sourceFile, classDeclaration, 'IUserForm', control({ name: 'address', role: 'group', isOptional: true }));
      const property = sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('address');
      expect(property.hasQuestionToken()).toBe(true);
      expect(property.getTypeNode()!.getText()).toBe('IUserAddressForm');
    });

    it('should skip the interface if a type alias exists', () => {
      const sourceFile = project.createSourceFile('t.ts', 'type IUserForm = {};');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormTypeGroup(sourceFile, classDeclaration, 'IUserForm', control({ name: 'address', role: 'group' }));
      expect(sourceFile.getInterface('IUserForm')).toBeUndefined();
    });
  });

  describe('CoerceFormArray', () => {
    it('should add an array property referencing the nested form definition', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      const { propertyDeclaration, decoratorDeclaration } = CoerceFormArray(
        sourceFile, classDeclaration, 'IUserForm', control({ name: 'phones', role: 'array', state: '[]' }),
      );
      expect(GetFormArrayNameFromFormDefinitionName('UserForm', 'phones')).toBe('User-phones');
      expect(propertyDeclaration.getTypeNode()!.getText()).toBe('FormDefinitionArray<UserPhonesForm>');
      expect(decoratorDeclaration.getName()).toBe('UseFormArrayGroup');
      expect(decoratorDeclaration.getArguments()[0].getText()).toBe('UserPhonesForm');
      expect(decoratorDeclaration.getArguments()[1].getText()).toContain('state: []');
      const forms = sourceFile.getImportDeclarationOrThrow('@rxap/forms');
      expect(forms.getNamedImports().map(i => i.getName())).toEqual(expect.arrayContaining([ 'UseFormArrayGroup', 'FormDefinitionArray' ]));
    });

    it('should add the array to the interface', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormTypeArray(sourceFile, classDeclaration, 'IUserForm', control({ name: 'phones', role: 'array' }));
      const property = sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('phones');
      expect(property.getTypeNode()!.getText()).toBe('Array<IUserPhonesForm>');
    });

    it('should skip the interface if a type alias exists', () => {
      const sourceFile = project.createSourceFile('t.ts', 'type IUserForm = {};');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormTypeArray(sourceFile, classDeclaration, 'IUserForm', control({ name: 'phones', role: 'array' }));
      expect(sourceFile.getInterface('IUserForm')).toBeUndefined();
    });
  });

  describe('CoerceInterfaceFormType', () => {
    it('should add every control role to the interface', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormType(sourceFile, classDeclaration, 'IUserForm', {
        name: 'user',
        project: 'p',
        controlList: [
          control({ name: 'name' }),
          control({ name: 'address', role: 'group' }),
          control({ name: 'phones', role: 'array' }),
        ],
      } as any);
      const interfaceDeclaration = sourceFile.getInterfaceOrThrow('IUserForm');
      expect(interfaceDeclaration.getProperties().map(p => p.getName())).toEqual([ 'name', 'address', 'phones' ]);
    });

    it('should throw for an unknown role', () => {
      const sourceFile = project.createSourceFile('t.ts', '');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      expect(() => CoerceInterfaceFormType(sourceFile, classDeclaration, 'IUserForm', {
        name: 'user',
        controlList: [ control({ name: 'x', role: 'other' as any }) ],
      } as any)).toThrow('Unknown control role: other');
    });

    it('should skip if a type alias exists', () => {
      const sourceFile = project.createSourceFile('t.ts', 'type IUserForm = {};');
      const classDeclaration = sourceFile.addClass({ name: 'UserForm' });
      CoerceInterfaceFormType(sourceFile, classDeclaration, 'IUserForm', { name: 'user' } as any);
      expect(sourceFile.getInterface('IUserForm')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('CoerceFormDefinitionControl should call the callbacks with the class and interface name', async () => {
      const coerceFormTypeControl = jest.fn();
      const coerceFormControl = jest.fn();
      const tsMorphTransform = jest.fn();
      await exec(CoerceFormDefinitionControl({
        ...control({ name: 'a' }),
        project: 'p',
        formName: 'user',
        coerceFormTypeControl,
        coerceFormControl,
        tsMorphTransform,
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      expect(sourceFile.getClassOrThrow('UserForm').isExported()).toBe(true);
      expect(coerceFormTypeControl.mock.calls[0][2]).toBe('IUserForm');
      expect(coerceFormControl.mock.calls[0][2]).toBe('IUserForm');
      expect(tsMorphTransform).toHaveBeenCalledWith(sourceFile, sourceFile.getClassOrThrow('UserForm'));
    });

    it('CoerceFormDefinitionFormControl should add the control to the interface and the class', async () => {
      await exec(CoerceFormDefinitionFormControl({
        ...control({ name: 'name', isRequired: true }),
        project: 'p',
        formName: 'user',
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      expect(sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('name')).toBeDefined();
      expect(sourceFile.getClassOrThrow('UserForm').getPropertyOrThrow('name').getDecoratorOrThrow('UseFormControl').getText())
        .toContain('Validators.required');
    });

    it('CoerceFormDefinitionFormGroup should add the group to the interface and the class', async () => {
      await exec(CoerceFormDefinitionFormGroup({
        ...control({ name: 'address', role: 'group' }),
        project: 'p',
        formName: 'user',
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      expect(sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('address').getTypeNode()!.getText()).toBe('IUserAddressForm');
      expect(sourceFile.getClassOrThrow('UserForm').getPropertyOrThrow('address').getDecoratorOrThrow('UseFormGroup')).toBeDefined();
    });

    it('CoerceFormDefinitionFormArray should add the array to the interface and the class', async () => {
      await exec(CoerceFormDefinitionFormArray({
        ...control({ name: 'phones', role: 'array' }),
        project: 'p',
        formName: 'user',
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      expect(sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('phones').getTypeNode()!.getText()).toBe('Array<IUserPhonesForm>');
      expect(sourceFile.getClassOrThrow('UserForm').getPropertyOrThrow('phones').getDecoratorOrThrow('UseFormArrayGroup')).toBeDefined();
    });

    it('CoerceFormDefinitionTypeRule should use the custom coerceFormType', async () => {
      const coerceFormType = jest.fn();
      await exec(CoerceFormDefinitionTypeRule({ name: 'user', project: 'p', coerceFormType } as any));
      expect(coerceFormType).toHaveBeenCalledTimes(1);
      expect(coerceFormType.mock.calls[0][2]).toBe('IUserForm');
      expect(coerceFormType.mock.calls[0][1].getName()).toBe('UserForm');
    });

    it('CoerceFormDefinitionTypeRule should generate the interface by default', async () => {
      await exec(CoerceFormDefinitionTypeRule({
        name: 'user', project: 'p', controlList: [ control({ name: 'name' }) ],
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      expect(sourceFile.getInterfaceOrThrow('IUserForm').getPropertyOrThrow('name')).toBeDefined();
    });

    it('CoerceFormDefinition should generate the complete form definition', async () => {
      const tsMorphTransform = jest.fn();
      await exec(CoerceFormDefinition({
        name: 'user',
        project: 'p',
        tsMorphTransform,
        controlList: [
          control({ name: 'name', isRequired: true }),
          control({ name: 'address', role: 'group' }),
          control({ name: 'phones', role: 'array' }),
        ],
      } as any));
      const sourceFile = project.getSourceFileOrThrow('/user.form.ts');
      const classDeclaration = sourceFile.getClassOrThrow('UserForm');
      expect(classDeclaration.getImplements().map(i => i.getText())).toEqual([ 'FormType<IUserForm>' ]);
      expect(classDeclaration.getDecoratorOrThrow('RxapForm').getArguments()[0].getText()).toBe('\'user\'');
      expect(classDeclaration.getDecoratorOrThrow('Injectable')).toBeDefined();
      expect(classDeclaration.getPropertyOrThrow('rxapFormGroup').getTypeNode()!.getText()).toBe('RxapFormGroup<IUserForm>');
      expect(classDeclaration.getProperties().map(p => p.getName())).toEqual([ 'rxapFormGroup', 'name', 'address', 'phones' ]);
      expect(sourceFile.getInterfaceOrThrow('IUserForm').getProperties().map(p => p.getName())).toEqual([ 'name', 'address', 'phones' ]);
      expect(sourceFile.getImportDeclarationOrThrow('@angular/core').getNamedImports().map(i => i.getName())).toContain('Injectable');
      expect(tsMorphTransform).toHaveBeenCalledTimes(1);
    });

    it('CoerceFormDefinition should not duplicate the FormType implements and use custom coerceFormControls', async () => {
      project.createSourceFile('/user.form.ts', 'export class UserForm implements FormType<IUserForm> {}');
      const coerceFormControls = jest.fn();
      await exec(CoerceFormDefinition({ name: 'user', project: 'p', coerceFormControls } as any));
      const classDeclaration = project.getSourceFileOrThrow('/user.form.ts').getClassOrThrow('UserForm');
      expect(classDeclaration.getImplements()).toHaveLength(1);
      expect(coerceFormControls).toHaveBeenCalledTimes(1);
    });
  });

});
