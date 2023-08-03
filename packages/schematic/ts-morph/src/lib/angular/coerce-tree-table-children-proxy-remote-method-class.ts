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

export interface CoerceTreeTableChildrenProxyRemoteMethodClassOptions
  extends Omit<Omit<Omit<Omit<CoerceProxyRemoteMethodClassOptions, 'name'>, 'sourceType'>, 'targetType'>, 'proxyMethod'> {
  getChildrenOperationId: string;
  scope?: string | null;
}

export function CoerceTreeTableChildrenProxyRemoteMethodClass(options: CoerceTreeTableChildrenProxyRemoteMethodClassOptions) {
  let {
    tsMorphTransform,
    getChildrenOperationId,
    scope,
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
        moduleSpecifier: OperationIdToClassImportPath(getChildrenOperationId, scope),
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
        namedImports: [ OperationIdToParameterClassName(getChildrenOperationId) ],
        moduleSpecifier: OperationIdToParameterClassImportPath(getChildrenOperationId, scope),
      });
      return tsMorphTransform!(project, sourceFile, classDeclaration);
    },
  });
}
