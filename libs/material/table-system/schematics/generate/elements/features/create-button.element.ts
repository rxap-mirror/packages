import { FeatureElement } from './feature.element';
import {
  ElementChild,
  ElementDef,
  ElementExtends,
  ElementAttribute
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
  AddComponentProvider,
  NodeFactory
} from '@rxap/schematics-utilities';
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

  @ElementAttribute()
  public withPermission?: boolean;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TableCreateButtonDirectiveModule', '@rxap/material-table-system');
    this.module?.handleComponentModule({ sourceFile, options, project });
    this.routerLink?.handleComponentModule({ sourceFile, options, project });
    if (this.withPermission) {
      AddNgModuleImport(sourceFile, 'HasPermissionModule', '@mfd/shared/authorization/has-permission.module');
    }
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
    const providerObject: ProviderObject                                    = {
      provide: 'TABLE_CREATE_REMOTE_METHOD'
    };
    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        namedImports:    [ 'TABLE_CREATE_REMOTE_METHOD' ],
        moduleSpecifier: '@rxap/material-table-system'
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
      importStructures,
      options.overwrite
    );
  }

  public headerTemplate(): string {
    const attributes: string[] = [
      'mat-mini-fab',
      'color="primary"',
      '[rxapTableCreate]="tableDataSourceDirective"'
    ];
    if (this.withPermission) {
      attributes.push(`rxapHasEnablePermission="table.${this.__parent.id}.table.create-button"`);
    }
    return NodeFactory(
      'button',
      ...attributes
    )(
      NodeFactory('mat-icon')('add')
    );
  }

  public toValue({ options, project }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.module?.toValue({ options, project }) ?? noop(),
      this.windowForm?.toValue({ options, project }) ?? noop()
    ]);
  }

}
