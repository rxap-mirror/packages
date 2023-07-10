import {
  ObjectLiteralExpression,
  Project,
} from 'ts-morph';
import { AddControlValidator } from './add-control-validator';

describe('Helpers', () => {

  describe('AddControlValidator', () => {

    let project: Project;

    beforeEach(() => {
      project = new Project();
    });

    it('should add new validator property assignment if not exists', () => {

      const sourceFile = project.createSourceFile('test.ts', `const options = {};`);
      const controlOptions = sourceFile.getVariableDeclaration('options')!.getInitializer() as ObjectLiteralExpression;

      expect(controlOptions.getProperties()).toHaveLength(0);

      AddControlValidator('test', controlOptions);

      expect(controlOptions.getProperties()).toHaveLength(1);
      expect(controlOptions.getProperties()[0].getText()).toBe('validators: [test]');

    });

    it('should add a new validator property', () => {

      const sourceFile = project.createSourceFile('test.ts', `const options = { validators: [] };`);
      const controlOptions = sourceFile.getVariableDeclaration('options')!.getInitializer() as ObjectLiteralExpression;

      expect(controlOptions.getProperties()).toHaveLength(1);

      AddControlValidator('test', controlOptions);

      expect(controlOptions.getProperties()).toHaveLength(1);
      expect(controlOptions.getProperties()[0].getText()).toBe('validators: [test]');

    });

    it('should replace a validator property if exists', () => {

      const sourceFile = project.createSourceFile('test.ts', `const options = { validators: [test] };`);
      const controlOptions = sourceFile.getVariableDeclaration('options')!.getInitializer() as ObjectLiteralExpression;

      expect(controlOptions.getProperties()).toHaveLength(1);

      AddControlValidator('test', controlOptions);

      expect(controlOptions.getProperties()).toHaveLength(1);
      expect(controlOptions.getProperties()[0].getText()).toBe('validators: [test]');

    });

    it('should replace a validator property if multiple exists', () => {

      const sourceFile = project.createSourceFile(
        'test.ts',
        `const options = { validators: [value, test, newTest, exi] };`,
      );
      const controlOptions = sourceFile.getVariableDeclaration('options')!.getInitializer() as ObjectLiteralExpression;

      expect(controlOptions.getProperties()).toHaveLength(1);

      AddControlValidator('test', controlOptions);

      expect(controlOptions.getProperties()).toHaveLength(1);
      expect(controlOptions.getProperties()[0].getText()).toBe('validators: [value, test, newTest, exi]');

    });

  });

});
