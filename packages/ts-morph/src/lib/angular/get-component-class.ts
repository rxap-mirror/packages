import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';

/**
 * Gets the component class from a source file.
 * Assumes there is only one component class in the file.
 *
 * @param sourceFile - The source file to search.
 * @returns The component class declaration.
 */
export function GetComponentClass(sourceFile: SourceFile): ClassDeclaration {
  const classWithComponent = sourceFile.getClasses().find(cls => cls.getDecorator('Component'));

  if (!classWithComponent) {
    throw new Error('Could not find class with Component decorator!');
  }

  return classWithComponent;
}
