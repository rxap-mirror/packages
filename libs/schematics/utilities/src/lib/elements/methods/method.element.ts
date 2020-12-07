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

const { dasherize, classify, camelize } = strings;

@ElementDef('method')
export class MethodElement implements ParsedElement<string> {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public from?: string;

  public toValue({ sourceFile, project }: { sourceFile: SourceFile } & ToValueContext): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
    } else {
      const methodSourceFile = project.createSourceFile(join('/methods', `${dasherize(this.name)}.method.ts`));
      methodSourceFile.addClass({
        name:       `${classify(this.name)}Method`,
        isExported: true,
        decorators: [
          {
            name:      'Injectable',
            arguments: []
          }
        ],
        implements: [ 'Method' ],
        methods:    [
          {
            name:       'call',
            parameters: [ { name: 'parameters', type: 'any' } ],
            returnType: 'any'
          }
        ]
      });
      methodSourceFile.addImportDeclarations([
        {
          namedImports:    [ 'Injectable' ],
          moduleSpecifier: '@angular/core'
        },
        {
          namedImports:    [ 'Method' ],
          moduleSpecifier: '@rxap/utilities'
        }
      ]);
    }

    return this.name;
  }

}
