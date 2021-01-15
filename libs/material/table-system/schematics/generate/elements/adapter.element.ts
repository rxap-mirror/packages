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
  ToValueContext
} from '@rxap/schematics-utilities';
import { GenerateSchema } from '../schema';

@ElementDef('adapter')
export class AdapterElement implements ParsedElement, HandleComponent {

  @ElementTextContent()
  @ElementRequired()
  public factoryName!: string;

  @ElementAttribute('import')
  @ElementRequired()
  public importFrom!: string;

  public toValue(): any {
  }

  public handleComponent({ sourceFile, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): void {
    AddComponentProvider(
      sourceFile,
      {
        provide:  'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
        useValue: this.factoryName
      },
      [
        {
          namedImports:    [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
          // TODO : mv TABLE_REMOTE_METHOD_ADAPTER_FACTORY to rxap
          moduleSpecifier: '@rxap/material-table-system'
        },
        {
          namedImports:    [ this.factoryName ],
          moduleSpecifier: this.importFrom
        }
      ],
      options.overwrite
    );
  }

}
