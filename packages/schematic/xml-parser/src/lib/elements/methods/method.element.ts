import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementRequired,
  ElementTextContent,
  ParsedElement,
} from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  AddMethodClassOptions,
  CoerceImports,
  CoerceMethodClassLegacy,
  CoerceSourceFile,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { TypeElement } from '../type.element';

const {
  dasherize,
  classify,
  camelize,
} = strings;

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

  @ElementChild(TypeElement)
  public parameterType?: TypeElement;

  public toValue({sourceFile, project}: { sourceFile: SourceFile } & ToValueContext): string {
    if (this.from) {
      CoerceImports(sourceFile, {
        namedImports: [this.name],
        moduleSpecifier: this.from,
      });
      return this.name;
    } else {
      const methodName = CoerceSuffix(classify(this.name), 'Method');
      const methodFilePath = join('/methods', `${dasherize(this.name.replace(/[-_\s]?[m|M]ethod$/, ''))}.method.ts`);
      const methodSourceFile = CoerceSourceFile(project, methodFilePath);
      const methodOptions: AddMethodClassOptions = {
        statements: [`console.log('${dasherize(methodName)}', parameters);`],
      };
      if (this.parameterType) {
        methodOptions.parameterType = this.parameterType.toValue({sourceFile: methodSourceFile});
      }
      CoerceMethodClassLegacy(methodSourceFile, methodName, methodOptions);
      return methodName;
    }
  }

}
