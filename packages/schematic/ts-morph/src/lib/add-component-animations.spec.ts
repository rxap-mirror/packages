import {ArrayLiteralExpression, Project, PropertyAssignment} from 'ts-morph';
import {AddComponentAnimations} from './add-component-animations';
import {GetComponentOptionsObject} from './get-component-options-object';

describe('@rxap/schematics-utilities', () => {

  describe('AddComponentAnimations', () => {

    let project: Project;

    beforeEach(() => {
      project = new Project();
    });

    it('should add a animation to a component decorator', () => {

      const sourceFile = project.createSourceFile('test.ts', `
      @Component({
        selector: 'my-component'
      })
      class MyComponent {}
      `);

      AddComponentAnimations(sourceFile, 'RowAnimations', '@rxap/material-table-system');

      const componentOptions = GetComponentOptionsObject(sourceFile);
      const animationsProperty: PropertyAssignment = componentOptions.getProperty('animations') as any;
      expect(animationsProperty).toBeDefined();
      expect(animationsProperty).toBeInstanceOf(PropertyAssignment);

      const animationsInitializer: ArrayLiteralExpression = animationsProperty.getInitializer() as any;
      expect(animationsInitializer).toBeDefined();
      expect(animationsInitializer).toBeInstanceOf(ArrayLiteralExpression);
      expect(animationsInitializer.getElements()).toHaveLength(1);
      const rowAnimationsElement = animationsInitializer.getElements()[0];
      expect(rowAnimationsElement.getFullText()).toBe('RowAnimations');
      expect(sourceFile.getImportDeclarations()).toHaveLength(1);
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@rxap/material-table-system');

    });

    it('should update the exing', () => {

      const sourceFile = project.createSourceFile('test.ts', `
      @Component({
        selector: 'my-component',
        animations: [ NewAnimations ]
      })
      class MyComponent {}
      `);

      AddComponentAnimations(sourceFile, 'RowAnimations', '@rxap/material-table-system');

      const componentOptions = GetComponentOptionsObject(sourceFile);
      const animationsProperty: PropertyAssignment = componentOptions.getProperty('animations') as any;
      expect(animationsProperty).toBeDefined();
      expect(animationsProperty).toBeInstanceOf(PropertyAssignment);

      const animationsInitializer: ArrayLiteralExpression = animationsProperty.getInitializer() as any;
      expect(animationsInitializer).toBeDefined();
      expect(animationsInitializer).toBeInstanceOf(ArrayLiteralExpression);
      expect(animationsInitializer.getElements()).toHaveLength(2);
      const rowAnimationsElement = animationsInitializer.getElements()[1];
      expect(rowAnimationsElement.getFullText().trim()).toBe('RowAnimations');
      expect(sourceFile.getImportDeclarations()).toHaveLength(1);
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@rxap/material-table-system');

    });

    it('should not add the same animations again', () => {

      const sourceFile = project.createSourceFile('test.ts', `
      @Component({
        selector: 'my-component',
        animations: [ RowAnimations ]
      })
      class MyComponent {}
      `);

      AddComponentAnimations(sourceFile, 'RowAnimations', '@rxap/material-table-system');

      const componentOptions = GetComponentOptionsObject(sourceFile);
      const animationsProperty: PropertyAssignment = componentOptions.getProperty('animations') as any;
      expect(animationsProperty).toBeDefined();
      expect(animationsProperty).toBeInstanceOf(PropertyAssignment);

      const animationsInitializer: ArrayLiteralExpression = animationsProperty.getInitializer() as any;
      expect(animationsInitializer).toBeDefined();
      expect(animationsInitializer).toBeInstanceOf(ArrayLiteralExpression);
      expect(animationsInitializer.getElements()).toHaveLength(1);
      const rowAnimationsElement = animationsInitializer.getElements()[0];
      expect(rowAnimationsElement.getFullText().trim()).toBe('RowAnimations');
      expect(sourceFile.getImportDeclarations()).toHaveLength(1);
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@rxap/material-table-system');

    });

  });

});
