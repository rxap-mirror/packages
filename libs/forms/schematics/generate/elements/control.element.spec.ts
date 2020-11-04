import { Project } from 'ts-morph';
import { ControlElement } from './control.element';

describe('Elements', () => {

  describe('ControlElement', () => {

    let project: Project;

    beforeEach(() => {
      project = new Project();
    });

    it('should add a new control', () => {

      const sourceFile = project.createSourceFile('test.ts', `class Form {}`);

      const classDeclaration = sourceFile.getClass('Form')!;
      const control          = new ControlElement();
      control.id             = 'name';

      const controlProperty = control.toValue({ classDeclaration, sourceFile, project, options: {} as any });

      expect(classDeclaration.getProperties()).toHaveLength(1);
      expect(controlProperty.getText()).toBe(`@UseFormControl({})
    public name!: RxapFormControl<any>;`);

    });

    it('should update control', () => {

      const sourceFile = project.createSourceFile('test.ts', `class Form { @UseFormControl() public name!: RxapFormControl; }`);

      const classDeclaration = sourceFile.getClass('Form')!;
      const control          = new ControlElement();
      control.id             = 'name';

      const controlProperty = control.toValue({ classDeclaration, sourceFile, project, options: {} as any });

      expect(classDeclaration.getProperties()).toHaveLength(1);
      expect(controlProperty.getText()).toBe('@UseFormControl({}) public name!: RxapFormControl<any>;');

    });

    it('should update control options', () => {

      const sourceFile = project.createSourceFile('test.ts', `class Form { @UseFormControl() public name!: RxapFormControl<string>; }`);

      const classDeclaration = sourceFile.getClass('Form')!;
      const control          = new ControlElement();
      control.id             = 'name';
      control.required       = true;
      control.disabled       = true;
      control.initial        = 'username';

      const controlProperty = control.toValue({ classDeclaration, sourceFile, project, options: {} as any });

      expect(classDeclaration.getProperties()).toHaveLength(1);
      expect(controlProperty.getText()).toBe(`@UseFormControl({
        state: username,
        validators: [Validators.required],
        disabled: true
    }) public name!: RxapFormControl<any>;`);

    });

  });

});
