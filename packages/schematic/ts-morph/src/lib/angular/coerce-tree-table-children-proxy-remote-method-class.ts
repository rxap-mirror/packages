import {
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
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
  const {
    tsMorphTransform = noop,
    getChildrenOperationId,
    scope,
  } = options;
  return CoerceProxyRemoteMethodClass({
    ...options,
    name: 'tree-table-children',
    sourceType: Writers.object({ node: 'Node<unknown>' }),
    targetType: `OpenApiRemoteMethodParameter<${ OperationIdToParameterClassName(getChildrenOperationId) }>`,
    proxyMethod: OperationIdToRemoteMethodClassName(getChildrenOperationId),
    tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToRemoteMethodClassName(getChildrenOperationId) ],
        moduleSpecifier: OperationIdToClassRemoteMethodImportPath(getChildrenOperationId, scope),
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
      return tsMorphTransform(project, sourceFile, classDeclaration);
    },
  });
}
