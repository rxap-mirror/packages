import {
  ElementDef,
  ElementExtends,
  ElementChild,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';
import { ParsedElement } from '@rxap/xml-parser';
import {
  HandleComponentModule,
  HandleComponent,
  ToValueContext,
  ModuleElement,
  OpenApiRemoteMethodElement,
  AddComponentProvider
} from '@rxap/schematics-utilities';
import {
  Rule,
  chain,
  noop
} from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { GenerateSchema } from '../../../schema';
import { WindowFormElement } from '../window-form.element';

const { dasherize, classify, camelize } = strings;

@ElementDef('loader')
export class EditActionLoaderElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {}

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {}

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}

@ElementExtends(EditActionLoaderElement)
@ElementDef('mfd-loader')
export class MfdLoaderElement extends EditActionLoaderElement {

  @ElementChild(OpenApiRemoteMethodElement)
  @ElementRequired()
  public method!: OpenApiRemoteMethodElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, sourceFile, options });
    AddComponentProvider(
      sourceFile,
      {
        provide:  'ROW_EDIT_LOADER_METHOD',
        useClass: 'RowEditLoaderMethod'
      },
      [
        {
          moduleSpecifier: '@mfd/shared/row-edit-loader.method',
          namedImports:    [ 'RowEditLoaderMethod' ]
        },
        {
          moduleSpecifier: '@mfd/shared/table-row-controls/tokens',
          namedImports:    [ 'ROW_EDIT_LOADER_METHOD' ]
        }
      ],
      options.overwrite
    );
    AddComponentProvider(
      sourceFile,
      {
        provide:  'ROW_EDIT_LOADER_SOURCE_METHOD',
        useClass: this.method.toValue({ options, sourceFile })
      },
      [
        {
          moduleSpecifier: '@mfd/shared/row-edit-loader.method',
          namedImports:    [ 'ROW_EDIT_LOADER_SOURCE_METHOD' ]
        }
      ],
      options.overwrite
    );
  }

}

@ElementExtends(ActionButtonElement)
@ElementDef('edit-action')
export class EditActionElement extends MethodActionElement {

  public type = 'edit';

  @ElementChild(EditActionLoaderElement)
  public loader?: EditActionLoaderElement;

  @ElementChild(ModuleElement)
  public module?: ModuleElement;

  @ElementChild(WindowFormElement)
  public windowForm?: WindowFormElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, options, sourceFile });
    this.loader?.handleComponent({ project, options, sourceFile });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.loader?.handleComponentModule({ project, options, sourceFile });
    this.module?.handleComponentModule({ project, sourceFile, options });
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.loader?.toValue({ project, options }) ?? (noop()),
      this.module?.toValue({ project, options }) ?? (noop()),
      this.windowForm?.toValue({ project, options }) ?? (noop())
    ]);
  }

}
