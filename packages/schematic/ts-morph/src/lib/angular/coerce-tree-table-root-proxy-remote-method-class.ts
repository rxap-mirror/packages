import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  CoerceProxyRemoteMethodClass,
  CoerceProxyRemoteMethodClassOptions,
} from './coerce-proxy-remote-method-class';

export interface CoerceTreeTableRootProxyRemoteMethodClassOptions
  extends Omit<Omit<Omit<Omit<CoerceProxyRemoteMethodClassOptions, 'name'>, 'sourceType'>, 'targetType'>, 'proxyMethod'> {
  getRootOperationId: string;
  scope?: string;
}

export function CoerceTreeTableRootProxyRemoteMethodClass(options: CoerceTreeTableRootProxyRemoteMethodClassOptions) {
  let {
    tsMorphTransform,
    getRootOperationId,
    scope,
  } = options;
  tsMorphTransform ??= () => ({});
  return CoerceProxyRemoteMethodClass({
    ...options,
    name: 'tree-table-root',
    sourceType: 'Node<unknown>',
    targetType: `OpenApiRemoteMethodParameter<${ OperationIdToParameterClassName(getRootOperationId) }>`,
    proxyMethod: OperationIdToClassName(getRootOperationId),
    tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToClassName(getRootOperationId) ],
        moduleSpecifier: OperationIdToClassImportPath(getRootOperationId, scope),
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'Node' ],
        moduleSpecifier: '@rxap/data-structure-tree',
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'OpenApiRemoteMethodParameter' ],
        moduleSpecifier: '@rxap/open-api/remote-method',
      });
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToParameterClassName(getRootOperationId) ],
        moduleSpecifier: OperationIdToParameterClassImportPath(getRootOperationId, scope),
      });
      return tsMorphTransform!(project, sourceFile, classDeclaration);
    },
  });
}
