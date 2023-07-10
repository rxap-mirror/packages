import {
  ElementAttribute,
  ElementDef,
  ElementExtends,
  ElementRequired,
  ElementTextContent,
  ParsedElement,
} from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  IMethodElement,
  MethodElement,
} from './method.element';
import { CoerceImports } from '@rxap/schematics-ts-morph';

const {
  dasherize,
  classify,
  camelize,
} = strings;

@ElementExtends(MethodElement)
@ElementDef('open-api-remote-method')
export class OpenApiRemoteMethodElement implements ParsedElement<string>, IMethodElement {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public mock?: boolean;

  public toValue({sourceFile, options}: { sourceFile: SourceFile, options: { openApiModule?: string } }): string {

    const openApiRemoteMethodName = classify(this.name) + 'RemoteMethod';

    if (!options.openApiModule) {
      throw new Error('The open api module is not defined!');
    }

    CoerceImports(sourceFile, {
      namedImports: [openApiRemoteMethodName],
      moduleSpecifier: `${options.openApiModule}/remote-methods/${dasherize(this.name)}.remote-method`,
    });

    return openApiRemoteMethodName;

  }

}
