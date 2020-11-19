import {
  SourceFile,
  ClassDeclaration
} from 'ts-morph';

export function GetComponentClass(sourceFile: SourceFile): ClassDeclaration {
  const classWithComponent = sourceFile.getClasses().find(cls => cls.getDecorator('Component'));

  if (!classWithComponent) {
    throw new Error('Could not find class with Component decorator!');
  }

  return classWithComponent;
}
