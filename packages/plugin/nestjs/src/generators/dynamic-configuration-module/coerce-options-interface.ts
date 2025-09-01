import { Project } from 'ts-morph';
import { dasherize } from '@rxap/utilities';
import {
  CoerceInterface,
  CoerceSourceFile,
} from '@rxap/ts-morph';

export function coerceOptionsInterface(project: Project, moduleName: string) {
  const interfaceName = `${ moduleName }Options`;
  const interfaceFileName = `${ dasherize(interfaceName) }.ts`;
  const sourceFile = CoerceSourceFile(project, interfaceFileName);
  CoerceInterface(sourceFile, interfaceName, {
    isExported: true,
    properties: [
      {
        name: 'disabled',
        type: 'boolean',
      }
    ]
  });
}
