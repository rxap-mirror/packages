import {
  ElementDef,
  ElementExtends,
  ElementChild,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';
import { ParsedElement } from '@rxap/xml-parser';
import {
  HandleComponentModule,
  HandleComponent,
  ToValueContext,
  AddNgModuleProvider
} from '@rxap-schematics/utilities';
import {
  Rule,
  noop
} from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';

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

  @ElementTextContent()
  @ElementRequired()
  public operationId!: string;

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleProvider(sourceFile, {
      provide:  'ROW_EDIT_LOADER_METHOD',
      useClass: 'RowEditLoaderMethod'
    }, [
      {
        moduleSpecifier: '@mfd/shared/row-edit-loader.method',
        namedImports:    [ 'RowEditLoaderMethod' ]
      },
      {
        moduleSpecifier: '@mfd/shared/table-row-controls/tokens',
        namedImports:    [ 'ROW_EDIT_LOADER_METHOD' ]
      }
    ]);
    AddNgModuleProvider(sourceFile, {
      provide:  'ROW_EDIT_LOADER_OPEN_API_METHOD',
      useClass: `${classify(this.operationId)}RemoteMethod`
    }, [
      {
        moduleSpecifier: '@mfd/shared/row-edit-loader.method',
        namedImports:    [ 'ROW_EDIT_LOADER_SOURCE_METHOD' ]
      },
      {
        moduleSpecifier: `@mfd/open-api/remote-methods/${dasherize(this.operationId)}.remote-method`,
        namedImports:    [ `${classify(this.operationId)}RemoteMethod` ]
      }
    ]);
  }

}

@ElementExtends(ActionButtonElement)
@ElementDef('edit-action')
export class EditActionElement extends MethodActionElement {

  public type = 'edit';

  @ElementChild(EditActionLoaderElement)
  public loader?: EditActionLoaderElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, options, sourceFile });
    this.loader?.handleComponent({ project, options, sourceFile });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.loader?.handleComponentModule({ project, options, sourceFile });
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return this.loader?.toValue({ project, options }) ?? (noop());
  }

}
