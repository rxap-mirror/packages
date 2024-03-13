import { DecoratableNode } from 'ts-morph';
import { CoerceDecorator } from './coerce-decorator';
import { CreateProject } from './create-project';

describe('CoerceDecorator', () => {

  let decoratableNode: DecoratableNode;

  beforeEach(() => {
    const project = CreateProject();
    const sourceFile = project.createSourceFile('test.ts', `export class MyClass {}`);
    decoratableNode = sourceFile.getClassOrThrow('MyClass');
  });

  it('should add the decorator if not exists', () => {

    CoerceDecorator(decoratableNode, 'MyDecorator');

    expect(decoratableNode.getDecorators().map(decorator => decorator.getText())).toEqual([ '@MyDecorator' ]);

  });

  it('should not add the decorator if exists', () => {

    decoratableNode.addDecorator({ name: 'MyDecorator' });

    CoerceDecorator(decoratableNode, 'MyDecorator');

    expect(decoratableNode.getDecorators().map(decorator => decorator.getText())).toEqual([ '@MyDecorator' ]);

  });

});
