import {
  ClassDeclaration,
  Project,
} from 'ts-morph';
import { CoerceClassImplementation } from './coerce-class-implementation';

describe('CoerceClassImplementation', () => {

  let classDeclaration: ClassDeclaration;

  beforeEach(() => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('test.ts', `export class MyClass {}`);
    classDeclaration = sourceFile.getClassOrThrow('MyClass');
  });

  it('should add the implementation if not exists', () => {

    CoerceClassImplementation(classDeclaration, 'MyImplementation');

    expect(classDeclaration.getImplements().map(impl => impl.getText())).toEqual([ 'MyImplementation' ]);

  });

  it('should not add the implementation if exists', () => {

    classDeclaration.addImplements('MyImplementation');

    CoerceClassImplementation(classDeclaration, 'MyImplementation');

    expect(classDeclaration.getImplements().map(impl => impl.getText())).toEqual([ 'MyImplementation' ]);

  });

});
