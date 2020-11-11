import { FeatureElement } from './feature.element';
import {
  ElementChild,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile
} from 'ts-morph';
import { MethodElement } from '../methods/method.element';
import { RouterLinkElement } from '../router-link.element';
import {
  ProviderObject,
  AddNgModuleProvider,
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';

@ElementExtends(FeatureElement)
@ElementDef('create-button')
export class CreateButtonElement extends FeatureElement {

  @ElementChild(RouterLinkElement)
  public routerLink?: RouterLinkElement;

  @ElementChild(MethodElement)
  public method?: MethodElement;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TableCreateButtonComponentModule', '@mfd/shared/table-create-button/table-create-button.component.module');
    const providerObject: ProviderObject                                    = {
      provide: 'TABLE_CREATE_REMOTE_METHOD'
    };
    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        namedImports:    [ 'TABLE_CREATE_REMOTE_METHOD' ],
        moduleSpecifier: '@mfd/shared/table-create-button/tokens'
      }
    ];

    if (this.routerLink) {
      Object.assign(providerObject, this.routerLink.toValue({ sourceFile, project, options, type: 'create' }));
    } else if (this.method) {
      providerObject.useClass = this.method.toValue({ sourceFile, project, options });
    } else {
      providerObject.useValue = 'null';
    }

    AddNgModuleProvider(
      sourceFile,
      providerObject,
      importStructures
    );
  }

  public headerTemplate(): string {
    return '<mfd-table-create-button></mfd-table-create-button>';
  }

}
