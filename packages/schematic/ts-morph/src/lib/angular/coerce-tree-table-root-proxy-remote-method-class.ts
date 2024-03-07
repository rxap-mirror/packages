import { OperationIdToParameterClassImportPath } from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
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
  scope?: string | null;
  hasParameter?: boolean;
}

export function CoerceTreeTableRootProxyRemoteMethodClass(options: CoerceTreeTableRootProxyRemoteMethodClassOptions) {
  const {
    tsMorphTransform = noop,
    getRootOperationId,
    scope,
    identifier
  } = options;
  return CoerceProxyRemoteMethodClass({
    ...options,
    name: 'tree-table-root',
    sourceType: 'Node<unknown>',
    targetType: `OpenApiRemoteMethodParameter<${ identifier ? OperationIdToParameterClassName(getRootOperationId) : 'void' }>`,
    proxyMethod: OperationIdToClassName(getRootOperationId),
    tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {
      if (identifier) {
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToParameterClassName(getRootOperationId) ],
          moduleSpecifier: OperationIdToParameterClassImportPath(getRootOperationId, scope),
        });
      }
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
      return tsMorphTransform!(project, sourceFile, classDeclaration);
    },
  });
}
