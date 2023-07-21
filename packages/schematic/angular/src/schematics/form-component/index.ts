import {
  FormComponentControl,
  FormComponentOptions,
} from './schema';
import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  schematic,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  camelize,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { strings } from '@angular-devkit/core';
import {
  BuildAngularBasePath,
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceFormComponentProviderRule,
  CoerceFormSubmitOperation,
  DtoClassProperty,
  HasComponent,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import { joinWithDash } from '@rxap/utilities';
import { join } from 'path';
import { WriterFunction } from 'ts-morph';

interface NormalizedFormComponentOptions extends Required<FormComponentOptions> {
  controlList: Array<Required<FormComponentControl>>;
  componentName: string;
}

export function NormalizeFormControl(
  control: string | FormComponentControl,
): Required<FormComponentControl> {
  let name: string;
  let type: string | WriterFunction;

  let isRequired = false;
  let state: string | WriterFunction;
  let validatorList: string[] = [];
  if (typeof control === 'string') {
    // name:type:isRequired:state:validators
    // username:string:true:my-default-username:minLength(3),maxLength(20)
    const fragments = control.split(':');
    name = fragments[0];
    type = fragments[1];
    isRequired = fragments[2] === 'true';
    state = fragments[3];
    if (fragments[4]) {
      // ensure that the value is not an empty string
      validatorList = fragments[4].split(/,(?![^(]*\))/g);
    }
  } else {
    name = control.name;
    type = control.type;
    isRequired = control.isRequired ?? false;
    state = control.state;
    validatorList = control.validatorList;
  }
  return {
    name: camelize(name),
    type: type ?? 'unknown',
    isRequired,
    state: state ?? '',
    validatorList: validatorList ?? [],
  };
}

export function NormalizeFormControlList(
  controlList: Array<string | FormComponentControl>,
): Array<Required<FormComponentControl>> {
  return controlList.map(NormalizeFormControl);
}

export function NormalizeFormComponentOptions(
  options: Readonly<FormComponentOptions>,
): Readonly<NormalizedFormComponentOptions> {
  const name = dasherize(options.name);
  const componentName = CoerceSuffix(name, '-form');
  const nestModule = options.nestModule ?? undefined;
  const controllerName = options.controllerName ?? componentName;
  return Object.seal({
    name,
    project: dasherize(options.project),
    feature: dasherize(options.feature),
    window: options.window,
    directory: join(options.directory ?? '', componentName),
    shared: options.shared ?? false,
    role: options.role,
    componentName,
    nestModule,
    controllerName,
    controlList: NormalizeFormControlList(options.controlList),
    context:
      options.context ??
      joinWithDash([ nestModule, controllerName ], { removeDuplicated: true }),
  });
}

export function FormComponentControlToDtoClassProperty(
  control: FormComponentControl,
): DtoClassProperty {
  return {
    name: control.name,
    type: control.type ?? 'unknown',
    isOptional: !control.isRequired,
  };
}

export default function (options: FormComponentOptions) {
  const normalizedOptions = NormalizeFormComponentOptions(options);
  const {
    componentName,
    controllerName,
    role,
    name,
    project,
    feature,
    shared,
    directory,
    controlList,
    nestModule,
    window,
    context,
  } = normalizedOptions;
  console.log(
    `===== Generating form '${ name }' for project '${ project }' in feature '${ feature }' in directory '${ directory }' with context '${ context }' and the nest module '${ nestModule }' and controller '${ controllerName }' ...`,
  );
  return function (host: Tree) {
    const basePath = BuildAngularBasePath(host, normalizedOptions);
    const hasComponent = HasComponent(host, {
      project,
      feature,
      name: componentName,
      directory,
    });
    const submitOperationId = buildOperationId(
      normalizedOptions,
      'submit',
      BuildNestControllerName({
        controllerName,
        nestModule,
      }),
    );

    return chain([
      () => console.log(`Coerce form component '${ componentName }'`),
      CoerceComponentRule({
        project,
        feature,
        name: componentName,
        directory,
        template: {
          options: {
            ...normalizedOptions,
            OperationIdToClassName,
            OperationIdToClassImportPath,
          },
        },
      }),
      window && !hasComponent
        ? mergeWith(
          apply(url('./files/window'), [
            applyTemplates({
              ...strings,
              ...normalizedOptions,
              OperationIdToClassName,
              OperationIdToClassImportPath,
            }),
            move(basePath),
          ]),
          MergeStrategy.Overwrite,
        )
        : noop(),
      () => console.log(`Coerce form definition files`),
      schematic('form-definition', {
        name,
        project,
        directory,
        feature,
        controlList,
      }),
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
            moduleSpecifier: '@digitaix/eurogard-table-system',
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
            moduleSpecifier: OperationIdToClassImportPath(submitOperationId),
            namedImports: [ OperationIdToClassName(submitOperationId) ],
          },
        ],
      }),
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
  };
}
