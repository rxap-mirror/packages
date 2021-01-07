import { ElementChild } from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile
} from 'ts-morph';
import { RouterLinkElement } from '../../router-link.element';
import {
  ToValueContext,
  ProviderObject,
  MethodElement,
  AddComponentProvider
} from '@rxap/schematics-utilities';

export abstract class MethodActionElement extends ActionButtonElement {

  @ElementChild(MethodElement)
  public method?: MethodElement;

  @ElementChild(RouterLinkElement)
  public routerLink?: RouterLinkElement;

  public abstract type: string;

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
    const provide                                                           = `ROW_${this.type.toUpperCase()}_METHOD`;
    const providerObject: ProviderObject                                    = {
      provide
    };
    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        namedImports:    [ provide ],
        moduleSpecifier: '@mfd/shared/table-row-controls/tokens'
      }
    ];
    if (this.method) {
      providerObject.useClass = this.method.toValue({ sourceFile, project, options });
    } else if (this.routerLink) {
      Object.assign(providerObject, this.routerLink.toValue({ sourceFile, project, options, type: this.type }));
    } else {
      providerObject.useValue = 'null';
    }
    AddComponentProvider(
      sourceFile,
      providerObject,
      importStructures,
      options.overwrite
    );
  }

}
