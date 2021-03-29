import {
  ElementDef,
  ElementExtends,
  ElementChild,
  ElementRequired,
  ElementTextContent,
  ElementAttribute
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
  AddComponentProvider,
  AddComponentFakeProvider,
  ProviderObject,
  CoerceSourceFile,
  CoerceMethodClass
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
import { join } from 'path';
import { TableElement } from '../../table.element';
import { CoerceSuffix } from '@rxap/utilities';

const { dasherize, classify, camelize } = strings;

@ElementDef('adapter')
export class AdapterElement implements ParsedElement {

  public __parent!: EditActionLoaderElement;

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

  @ElementTextContent()
  @ElementRequired()
  public factoryName!: string;
  @ElementAttribute('import')
  @ElementRequired()
  public importFrom!: string;

}

@ElementDef('loader')
export class EditActionLoaderElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __parent!: EditActionElement;

  @ElementChild(OpenApiRemoteMethodElement)
  @ElementRequired()
  public method!: OpenApiRemoteMethodElement;

  @ElementChild(AdapterElement)
  public adapter?: AdapterElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    const loadMethodName                   = this.method.toValue({ options, sourceFile });
    let loadMethodProvider: ProviderObject = {
      provide:  'ROW_EDIT_LOADER_METHOD',
      useClass: loadMethodName
    };
    const importStructure                  = [
      {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports:    [ 'ROW_EDIT_LOADER_METHOD' ]
      }
    ];
    if (this.adapter) {
      loadMethodProvider = {
        provide:    'ROW_EDIT_LOADER_METHOD',
        useFactory: this.adapter.factoryName,
        deps:       [ loadMethodName ]
      };
    }
    if (this.method.mock) {
      const name                = this.__parent.__parent.__parent.name;
      const mockClassName       = `${CoerceSuffix(classify(name), 'TableEditActionLoader')}FakeMethod`;
      const mockClassFileName   = `${CoerceSuffix(dasherize(name), '-table-edit-action-loader')}.fake.method`;
      const methodClassFilePath = join(
        sourceFile.getDirectoryPath(),
        mockClassFileName + '.ts'
      );
      const methodSourceFile    = CoerceSourceFile(project, methodClassFilePath);
      CoerceMethodClass(
        methodSourceFile,
        mockClassName,
        {
          structures: [],
          returnType: 'Record<string, any>',
          statements: writer => {
            writer.writeLine('return {} as any');
          }
        }
      );
      AddComponentFakeProvider(
        sourceFile,
        {
          provide:  'ROW_EDIT_LOADER_METHOD',
          useClass: mockClassName
        },
        loadMethodProvider,
        [ 'table', name ].join('.'),
        [
          {
            moduleSpecifier: `./${mockClassFileName}`,
            namedImports:    [
              mockClassName
            ]
          },
          ...importStructure
        ]
      );
    } else {
      AddComponentProvider(
        sourceFile,
        loadMethodProvider,
        importStructure,
        options.overwrite
      );
    }
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {}

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}

@ElementExtends(EditActionLoaderElement)
@ElementDef('mfd-loader')
export class MfdLoaderElement extends EditActionLoaderElement {

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
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
          moduleSpecifier: '@rxap/material-table-system',
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
    // if a windowForm is used the corresponding FormProvider must be added
    if (this.windowForm) {

      const formProviderName = 'EditFormProviders';

      AddComponentProvider(
        sourceFile,
        formProviderName,
        [
          {
            moduleSpecifier: `./${join(dasherize(this.windowForm.name!) + '-form', 'form.providers')}`,
            namedImports:    [
              {
                name:  'FormProviders',
                alias: formProviderName
              }
            ]
          }
        ],
        options.overwrite
      );

    }
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
