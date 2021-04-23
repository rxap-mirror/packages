import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { CoerceSuffix } from '@rxap/utilities';
import {
  CoerceSourceFile,
  CoerceMethodClass,
  ToValueContext
} from '@rxap/schematics-ts-morph';

const { dasherize, classify, camelize } = strings;

export interface IMethodElement extends ParsedElement<string> {
  mock?: boolean;
}

@ElementDef('method')
export class MethodElement implements ParsedElement<string>, IMethodElement {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public from?: string;

  @ElementAttribute()
  public mock?: boolean;

  public toValue({ sourceFile, project }: { sourceFile: SourceFile } & ToValueContext): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
      return this.name;
    } else {
      const methodName       = CoerceSuffix(classify(this.name), 'Method');
      const methodFilePath   = join('/methods', `${dasherize(this.name.replace(/[-_\s]?[m|M]ethod$/, ''))}.method.ts`);
      const methodSourceFile = CoerceSourceFile(project, methodFilePath);
      CoerceMethodClass(methodSourceFile, methodName);
      return methodName;
    }
  }

}
