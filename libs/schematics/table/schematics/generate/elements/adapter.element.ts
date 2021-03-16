import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  HandleComponent,
  AddComponentProvider,
  ToValueContext,
  AddComponentMockProvider
} from '@rxap/schematics-utilities';
import { GenerateSchema } from '../schema';
import type { TableElement } from './table.element';

@ElementDef('adapter')
export class AdapterElement implements ParsedElement, HandleComponent {

  public __parent!: TableElement;

  @ElementTextContent()
  @ElementRequired()
  public factoryName!: string;

  @ElementAttribute('import')
  @ElementRequired()
  public importFrom!: string;

  public toValue(): any {
  }

  public handleComponent({ sourceFile, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): void {
    const providerObject  = {
      provide:  'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
      useValue: this.factoryName
    };
    const importStructure = [
      {
        namedImports:    [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
        moduleSpecifier: '@rxap/material-table-system'
      },
      {
        namedImports:    [ this.factoryName ],
        moduleSpecifier: this.importFrom
      }
    ];
    if (this.__parent.method?.mock) {
      AddComponentMockProvider(
        sourceFile,
        undefined,
        providerObject,
        importStructure,
        options.overwrite
      );
    } else {
      AddComponentProvider(
        sourceFile,
        providerObject,
        importStructure,
        options.overwrite
      );
    }
  }

}
