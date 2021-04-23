import {
  ElementDef,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  SourceFile,
  WriterFunction
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  ProviderObject,
  AddNgModuleImport,
  ToValueContext,
  HandleComponentModule
} from '@rxap/schematics-ts-morph';

const { dasherize, classify, camelize } = strings;

@ElementDef('router-link')
export class RouterLinkElement implements ParsedElement<Omit<ProviderObject, 'provide'>>, HandleComponentModule {

  @ElementTextContent()
  public link!: string;

  private buildStatements(sourceFile: SourceFile): WriterFunction {
    sourceFile.addImportDeclaration({
      namedImports:    [ 'ToMethod', 'getFromObject' ],
      moduleSpecifier: '@rxap/utilities'
    });
    return writer => {

      writer.write('return ToMethod((row: Record<string, any>) => router.navigate([');

      const parts       = this.link.split('/');
      const startAtRoot = parts[ 0 ] === '';
      if (startAtRoot) {
        parts.shift();
        writer.quote('/');
        writer.write(',');
      }
      for (const part of parts) {

        const match = part.match(/^{{([^}]+)}}$/);

        if (match) {

          const objectPath = match[ 1 ];

          writer.write('getFromObject(row, ');
          writer.quote(objectPath);
          writer.write(')');

        } else {
          writer.quote(part);
        }

        writer.write(',');

      }

      writer.write(']));');

    };
  }

  public toValue({ sourceFile, project, options, type }: ToValueContext & { sourceFile: SourceFile, type: string }): Omit<ProviderObject, 'provide'> {
    const factoryName                                     = classify(type) + 'MethodFactory';
    const providerObject: Omit<ProviderObject, 'provide'> = {
      deps:       [ 'Router', 'ActivatedRoute', 'INJECTOR' ],
      useFactory: factoryName
    };

    if (!sourceFile.getFunction(factoryName)) {

      sourceFile.addFunction({
        name:       factoryName,
        isExported: true,
        parameters: [
          {
            name: 'router',
            type: 'Router'
          }
        ],
        statements: [ this.buildStatements(sourceFile) ],
        returnType: 'Method'
      });
      sourceFile.addImportDeclarations([
        {
          namedImports:    [ 'Method' ],
          moduleSpecifier: '@rxap/utilities'
        }
      ]);

    }

    sourceFile.addImportDeclarations([
      {
        namedImports:    [ 'Router', 'ActivatedRoute' ],
        moduleSpecifier: '@angular/router'
      },
      {
        namedImports:    [ 'INJECTOR' ],
        moduleSpecifier: '@angular/core'
      }
    ]);

    return providerObject;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'RouterModule', '@angular/router');
  }

}
