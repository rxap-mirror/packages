import {
  ElementDef,
  ElementExtends,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { MethodElement } from './method.element';

const { dasherize, classify, camelize } = strings;

@ElementExtends(MethodElement)
@ElementDef('open-api-remote-method')
export class OpenApiRemoteMethodElement implements ParsedElement<string> {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  public toValue({ sourceFile, options }: { sourceFile: SourceFile, options: { openApiModule?: string } }): string {

    const openApiRemoteMethodName = classify(this.name) + 'RemoteMethod';

    if (!options.openApiModule) {
      throw new Error('The open api module is not defined!');
    }

    sourceFile.addImportDeclaration({
      namedImports:    [ openApiRemoteMethodName ],
      moduleSpecifier: `${options.openApiModule}/remote-methods/${dasherize(this.name)}.remote-method`
    });

    return openApiRemoteMethodName;

  }

}
