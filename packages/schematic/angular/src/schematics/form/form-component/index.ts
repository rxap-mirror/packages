import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceFormComponentProviderRule,
  CoerceFormSubmitOperation,
  DtoClassProperty,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import {
  NormalizedFormComponentControl,
  NormalizeFormComponentControlList,
} from '../../../lib/form-component-control';
import { FormComponentOptions } from './schema';

interface NormalizedFormComponentOptions
  extends Omit<Readonly<Normalized<FormComponentOptions> & NormalizedAngularOptions>, 'controlList'> {
  componentName: string;
  controllerName: string;
  controlList: Array<NormalizedFormComponentControl>;
  context: string;
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
  const controllerName = options.controllerName ?? componentName;
  const context = options.context ??
    joinWithDash([ nestModule, controllerName ], { removeDuplicated: true });
  return Object.seal({
    ...normalizedAngularOptions,
    window: options.window ?? false,
    directory: join(options.directory ?? '', componentName),
    role: options.role ?? null,
    componentName,
    controllerName,
    controlList: NormalizeFormComponentControlList(options.controlList),
    context,
  });
}

export function FormComponentControlToDtoClassProperty(
  control: NormalizedFormComponentControl,
): DtoClassProperty {
  return {
    name: control.name,
    type: control.type,
    isOptional: !control.isRequired,
  };
}

function componentRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    componentName,
    project,
    feature,
    directory,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce form component '${ componentName }'`),
    CoerceComponentRule({
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: {
          ...normalizedOptions,
          OperationIdToClassName,
          OperationIdToClassImportPath,
        },
      },
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
    }),
  ]);
}

function formSubmitProviderRule(normalizedOptions: NormalizedFormComponentOptions, submitOperationId: string): Rule {
  const {
    project,
    feature,
    directory,
    scope,
  } = normalizedOptions;
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
    context,
    componentName,
    controllerName,
    nestModule,
    shared,
  } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return chain([
        () => console.log(`Coerce form submit operation`),
        CoerceFormSubmitOperation({
          controllerName,
          project,
          feature,
          shared,
          nestModule,
          propertyList: controlList.map(FormComponentControlToDtoClassProperty),
          bodyDtoName: CoerceSuffix(context, '-' + componentName),
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
    const submitOperationId = buildOperationId(
      normalizedOptions,
      'submit',
      BuildNestControllerName({
        controllerName,
        nestModule,
      }),
    );
    return chain([
      formSubmitBackendRule(normalizedOptions),
      formSubmitProviderRule(normalizedOptions, submitOperationId),
    ]);
  }

  return noop();


}

function printFormComponentOptions(options: NormalizedFormComponentOptions) {
  PrintAngularOptions('form-component', options);
  console.log(`=== controls: ${ options.controlList.map((c) => c.name).join(', ') }`);
}

export default function (options: FormComponentOptions) {
  const normalizedOptions = NormalizeFormComponentOptions(options);
  printFormComponentOptions(normalizedOptions);
  return function () {
    return chain([
      componentRule(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      formSubmitRule(normalizedOptions),
    ]);
  };
}
