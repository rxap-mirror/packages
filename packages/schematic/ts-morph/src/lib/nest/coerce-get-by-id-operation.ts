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
import {
  DtoClassProperty,
  NormalizeDataClassProperty,
} from './dto-class-property';

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

function UpstreamMapper(sourceProperty: string, propertyList: DtoClassProperty[], idProperty?: OperationParameter | null) {
  const mapper: Record<string, string | WriterFunction> = {};
  if (idProperty) {
    mapper[idProperty.name] = idProperty.name;
  }
  for (const property of propertyList.filter(p => !idProperty || p.name !== idProperty.name).map(p => NormalizeDataClassProperty(p))) {
    mapper[property.name] = `${sourceProperty}.${ property.source ?? property.name }`;
    if (property.isType) {
      // property is a complex object
      if (property.isArray) {
        mapper[property.name] = w => {
          w.write(`${sourceProperty}.${ property.source ?? property.name }.map(item => (`);
          Writers.object(UpstreamMapper('item', property.memberList))(w);
          w.write('))');
        };
      } else {
        mapper[property.name] = Writers.object(UpstreamMapper(mapper[property.name] as string,property.memberList));
      }
    }
  }
  return mapper;
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
      if (isArray) {
        return w => {
          w.write('data.map(item => (');
          Writers.object(UpstreamMapper('data', propertyList, idProperty))(w);
          w.write('))');
        };
      } else {
        return Writers.object(UpstreamMapper('data', propertyList, idProperty));
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
