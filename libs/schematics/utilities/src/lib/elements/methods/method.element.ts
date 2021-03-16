import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ToValueContext } from '../../to-value-context';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { CoerceMethodClass } from '../../coerce-method-class';
import { CoerceSuffix } from '@rxap/utilities';
import { CoerceSourceFile } from '../../coerce-source-file';

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

  public postParse() {
    this.name = this.name.replace(/[-_\s]?[m,M]ethod$/, '');
  }

  public toValue({ sourceFile, project }: { sourceFile: SourceFile } & ToValueContext): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
      return this.name;
    } else {
      const methodName       = CoerceSuffix(classify(this.name), 'Method');
      const methodFilePath   = join('/methods', `${dasherize(this.name)}.method.ts`);
      const methodSourceFile = CoerceSourceFile(project, methodFilePath);
      CoerceMethodClass(methodSourceFile, methodName);
      return methodName;
    }
  }

}
