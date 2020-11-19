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
import { RouterLinkElement } from '../router-link.element';
import {
  ProviderObject,
  AddNgModuleImport,
  ToValueContext,
  ModuleElement,
  MethodElement,
  AddComponentProvider
} from '@rxap-schematics/utilities';
import {
  Rule,
  chain,
  noop
} from '@angular-devkit/schematics';
import { WindowFormElement } from './window-form.element';
import { GenerateSchema } from '../../schema';

@ElementExtends(FeatureElement)
@ElementDef('create-button')
export class CreateButtonElement extends FeatureElement {

  @ElementChild(RouterLinkElement)
  public routerLink?: RouterLinkElement;

  @ElementChild(MethodElement)
  public method?: MethodElement;

  @ElementChild(ModuleElement)
  public module?: ModuleElement;

  @ElementChild(WindowFormElement)
  public windowForm?: WindowFormElement;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TableCreateButtonComponentModule', '@mfd/shared/table-create-button/table-create-button.component.module');
    this.module?.handleComponentModule({ sourceFile, options, project });
    this.routerLink?.handleComponentModule({ sourceFile, options, project });
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
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

    AddComponentProvider(
      sourceFile,
      providerObject,
      importStructures
    );
  }

  public headerTemplate(): string {
    return '<mfd-table-create-button [dataSource]="dataSource"></mfd-table-create-button>';
  }

  public toValue({ options, project }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.module?.toValue({ options, project }) ?? noop(),
      this.windowForm?.toValue({ options, project }) ?? noop()
    ]);
  }

}
