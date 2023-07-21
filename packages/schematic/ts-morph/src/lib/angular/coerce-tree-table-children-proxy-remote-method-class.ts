import {
  CoerceProxyRemoteMethodClass,
  CoerceProxyRemoteMethodClassOptions,
} from './coerce-proxy-remote-method-class';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
} from '../operation-id-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceTreeTableChildrenProxyRemoteMethodClassOptions
  extends Omit<Omit<Omit<Omit<CoerceProxyRemoteMethodClassOptions, 'name'>, 'sourceType'>, 'targetType'>, 'proxyMethod'> {
  getChildrenOperationId: string;
}

export function CoerceTreeTableChildrenProxyRemoteMethodClass(options: CoerceTreeTableChildrenProxyRemoteMethodClassOptions) {
  let {
    tsMorphTransform,
    getChildrenOperationId,
  } = options;
  tsMorphTransform ??= () => ({});
  return CoerceProxyRemoteMethodClass({
    ...options,
    name: 'tree-table-children',
    sourceType: 'Node<unknown>',
    targetType: `OpenApiRemoteMethodParameter<${ OperationIdToParameterClassName(getChildrenOperationId) }>`,
    proxyMethod: OperationIdToClassName(getChildrenOperationId),
    tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToClassName(getChildrenOperationId) ],
        moduleSpecifier: OperationIdToClassImportPath(getChildrenOperationId),
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'Node' ],
        moduleSpecifier: '@rxap/utilities/rxjs',
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'OpenApiRemoteMethodParameter' ],
        moduleSpecifier: '@rxap/open-api/remote-method',
      });
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToParameterClassName(getChildrenOperationId) ],
        moduleSpecifier: OperationIdToParameterClassImportPath(getChildrenOperationId),
      });
      return tsMorphTransform!(project, sourceFile, classDeclaration);
    },
  });
}
