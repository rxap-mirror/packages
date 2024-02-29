import { OperationParameter } from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  CoerceGetControllerOptions,
  CoerceGetOperation,
} from './coerce-get-operation';
import { TransformOperation } from './coerce-operation';

export interface CoerceGetByIdControllerOptions extends CoerceGetControllerOptions {
  idProperty?: OperationParameter | null,
}

export function BuildUpstreamGetByIdParametersImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceGetByIdControllerOptions>,
): TransformOperation<string | WriterFunction> {
  return () => {
    const { idProperty} = options;
    return idProperty ? `{ parameters: { ${ idProperty.name } } }` : '';
  };
}

export function BuiltGetByIdDtoDataMapperImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceGetByIdControllerOptions>,
): TransformOperation<string | WriterFunction> {
  const {
    propertyList = [],
    upstream,
    isArray,
    idProperty,
  } = options;
  return () => {
    if (upstream) {
      const mapper: Record<string, string | WriterFunction> = {};
      if (idProperty) {
        mapper[idProperty.name] = idProperty.name;
      }
      for (const property of propertyList.filter(p => !idProperty || p.name !== idProperty.name)) {
        mapper[property.name] = `data.${ property.source ?? property.name }`;
      }
      if (isArray) {
        return w => {
          w.write('data.map(item => (');
          Writers.object(mapper)(w);
          w.write('))');
        };
      } else {
        return Writers.object(mapper);
      }
    } else {
      if (isArray) {
        return '[]';
      }
      if (idProperty) {
        return `{ ${ idProperty.name } }`;
      }
      return '{}';
    }
  };
}

export function CoerceGetByIdOperation(options: CoerceGetByIdControllerOptions) {
  const {
    controllerName,
    paramList= [],
    propertyList = [],
    idProperty = { name: 'uuid', type: 'string' },
    operationName = 'getById',
    nestModule,
    buildUpstreamGetParametersImplementation = BuildUpstreamGetByIdParametersImplementation,
    builtDtoDataMapperImplementation = BuiltGetByIdDtoDataMapperImplementation,
  } = options;

  if (idProperty) {
    /**
     * If the module is not specified. This controller has an own module. Else the
     * module is originated by another controller.
     *
     * **Example**
     * true:
     * The controller ReportDetailsController should be extended with getById Operation.
     * And the controller is used in the module ReportDetailsModule
     *
     * name = "report-details"
     * module = undefined
     *
     * false:
     * The controller ReportDetailsNotificationController should be extend with getById Operation.
     * And the controller ise used in the module ReportDetailsModule
     *
     * name = "notification"
     * module = "report-details"
     */
    const isFirstBornSibling = !nestModule || nestModule === controllerName;

    if (isFirstBornSibling) {
      CoerceArrayItems(propertyList, [{
        name: idProperty.name,
        type: idProperty.type ?? 'string',
        isArray: idProperty.isArray,
      }], (a, b) => a.name === b.name, true);
    }

    CoerceArrayItems(paramList,[{
      name: idProperty.name,
      type: idProperty.type,
      fromParent: idProperty.fromParent ?? !isFirstBornSibling,
    }], (a, b) => a.name === b.name, true);

  }

  return CoerceGetOperation({
    ...options,
    operationName,
    paramList,
    propertyList,
    buildUpstreamGetParametersImplementation,
    builtDtoDataMapperImplementation,
  });

}
