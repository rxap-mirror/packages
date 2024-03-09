import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  url,
} from '@angular-devkit/schematics';
import {
  BuildAngularBasePath,
  BuildNestControllerName,
  buildOperationId,
  CoerceFormComponentProviderRule,
  CoerceFormSubmitOperation,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../../../lib/accordion-identifier';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { CoerceFormComponentRule } from '../../../lib/coerce-form-component';
import {
  ControlToDtoClassProperty,
  NormalizeControlList,
  NormalizedControl,
} from '../../../lib/form/control';
import {
  NormalizedMatFormFieldDefaultOptions,
  NormalizeMatFormFieldDefaultOptions,
} from '../../../lib/mat-form-field-default-options';
import { FormComponentOptions } from './schema';

export interface NormalizedFormComponentOptions
  extends Omit<Readonly<Normalized<FormComponentOptions> & NormalizedAngularOptions>, 'controlList' | 'name' | 'matFormFieldDefaultOptions'> {
  componentName: string;
  controllerName: string;
  controlList: ReadonlyArray<NormalizedControl>;
  name: string;
  matFormFieldDefaultOptions: NormalizedMatFormFieldDefaultOptions | null;
  identifier: NormalizedAccordionIdentifier | null;
}


export function NormalizeFormComponentOptions(
  options: Readonly<FormComponentOptions>,
): Readonly<NormalizedFormComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const {
    name,
    nestModule,
  } = normalizedAngularOptions;
  const componentName = CoerceSuffix(name, '-form');
  const controllerName = options.controllerName ?? BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    window: options.window ?? false,
    directory: join(options.directory ?? '', componentName),
    role: options.role ?? null,
    componentName,
    controllerName,
    controlList: NormalizeControlList(options.controlList),
    context: options.context ? dasherize(options.context) : null,
    matFormFieldDefaultOptions: NormalizeMatFormFieldDefaultOptions(options.matFormFieldDefaultOptions),
    identifier: NormalizeAccordionIdentifier(options.identifier),
  });
}

function componentRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    componentName,
    project,
    feature,
    directory,
    overwrite,
    controlList,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce form component '${ componentName }'`),
    CoerceFormComponentRule({
      form: normalizedOptions,
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: {
          ...normalizedOptions,
        },
      }
    }),
  ]);

}

function formDefinitionRule(normalizedOptions: NormalizedFormComponentOptions): Rule {
  const {
    name,
    project,
    feature,
    directory,
    controlList,
    overwrite,
    backend,
    nestModule,
    controllerName,
  } = normalizedOptions;
  return chain([
    () => console.log(`Coerce form definition files`),
    ExecuteSchematic('form-definition', {
      name,
      project,
      directory,
      feature,
      controlList,
      overwrite,
      backend,
      nestModule,
      controllerName,
    }),
  ]);
}

function formSubmitProviderRule(normalizedOptions: NormalizedFormComponentOptions): Rule {
  const {
    project,
    feature,
    directory,
    scope,
  } = normalizedOptions;
  const submitOperationId = getSubmitOperationId(normalizedOptions);
  return chain([
    () => console.log(`Coerce form submit method`),
    CoerceFormComponentProviderRule({
      project,
      feature,
      directory,
      providerObject: {
        provide: 'RXAP_FORM_SUBMIT_METHOD',
        useFactory: 'SubmitContextFormAdapterFactory',
        deps: [
          OperationIdToClassName(submitOperationId),
          '[ new Optional(), RXAP_FORM_CONTEXT ]',
        ],
      },
      importStructures: [
        {
          moduleSpecifier: '@rxap/form-system',
          namedImports: [ 'SubmitContextFormAdapterFactory' ],
        },
        {
          moduleSpecifier: '@rxap/forms',
          namedImports: [ 'RXAP_FORM_SUBMIT_METHOD', 'RXAP_FORM_CONTEXT' ],
        },
        {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Optional' ],
        },
        {
          moduleSpecifier: OperationIdToClassImportPath(submitOperationId, scope),
          namedImports: [ OperationIdToClassName(submitOperationId) ],
        },
      ],
    }),
  ]);
}

function formSubmitBackendRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    backend,
    project,
    feature,
    controlList,
    controllerName,
    nestModule,
    shared,
    overwrite,
    identifier,
  } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return chain([
        () => console.log(`Coerce form submit operation`),
        CoerceFormSubmitOperation({
          controllerName,
          project,
          overwrite,
          feature,
          shared,
          nestModule,
          idProperty: identifier?.property,
          propertyList: controlList.map(ControlToDtoClassProperty),
          bodyDtoName: controllerName,
        }),
      ]);
  }

  return noop();

}

function formSubmitRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    backend,
    controllerName,
    nestModule,
  } = normalizedOptions;

  if ([ BackendTypes.NESTJS ].includes(backend)) {
    return chain([
      formSubmitBackendRule(normalizedOptions),
      formSubmitProviderRule(normalizedOptions),
    ]);
  }

  return noop();


}

function windowRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    window,
    directory,
    componentName,
  } = normalizedOptions;

  if (window) {
    return tree => {
      const basePath = BuildAngularBasePath(tree, normalizedOptions);
      const flat = !!directory?.endsWith(componentName);
      return chain([
        () => console.log(`Apply window specific templates.`),
        mergeWith(apply(url('./files/window'), [
          applyTemplates({
            componentName,
            name: dasherize(componentName).replace(/-form$/, ''),
            ...strings,
          }),
          move(flat ? basePath : join(basePath, componentName)),
        ]), MergeStrategy.Overwrite),
      ]);
    };
  }

  return noop();

}

function getSubmitOperationId(normalizedOptions: NormalizedFormComponentOptions): string {
  const {
    project,
    feature,
    shared,
    controllerName,
    identifier,
  } = normalizedOptions;
  return buildOperationId(
    {
      project,
      feature,
      shared,
    },
    identifier ? 'submitById' : 'submit',
    controllerName,
  );
}

function printFormComponentOptions(options: NormalizedFormComponentOptions) {
  PrintAngularOptions('form-component', options);
  if (options.controlList.length) {
    console.log(`=== controls: ${ options.controlList.map((c) => c.name).join(', ') }`);
  } else {
    console.log(`=== controls: NONE`);
  }
  console.log(`\x1b[34m===== WINDOW: \x1b[36m${ options.window }\x1b[0m`);
}

export default function (options: FormComponentOptions) {
  const normalizedOptions = NormalizeFormComponentOptions(options);
  printFormComponentOptions(normalizedOptions);
  return function () {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-component]'.green),
      componentRule(normalizedOptions),
      windowRule(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      formSubmitRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
