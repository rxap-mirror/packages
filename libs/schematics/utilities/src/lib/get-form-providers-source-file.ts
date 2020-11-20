import {
  Project,
  SourceFile
} from 'ts-morph';
import { AddToArray } from './add-to-array';

export function GetFormProvidersFile(project: Project): SourceFile {
  const formProviderSourceFilePath = 'form.providers';
  return project.getSourceFile(formProviderSourceFilePath + '.ts') ?? project.createSourceFile(formProviderSourceFilePath + '.ts');
}

export function AddToFormProviders(project: Project, value: string, overwrite: boolean = false): SourceFile {
  const sourceFile = GetFormProvidersFile(project);
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@angular/core',
    namedImports:    [ 'Provider' ]
  });
  AddToArray(sourceFile, 'FormProviders', value, 'Provider[]', overwrite);
  return sourceFile;
}
