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

export interface CoerceTreeTableRootProxyRemoteMethodClassOptions
  extends Omit<Omit<Omit<Omit<CoerceProxyRemoteMethodClassOptions, 'name'>, 'sourceType'>, 'targetType'>, 'proxyMethod'> {
  getRootOperationId: string;
}

export function CoerceTreeTableRootProxyRemoteMethodClass(options: CoerceTreeTableRootProxyRemoteMethodClassOptions) {
  let {
    tsMorphTransform,
    getRootOperationId,
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
        moduleSpecifier: OperationIdToClassImportPath(getRootOperationId),
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
        namedImports: [ OperationIdToParameterClassName(getRootOperationId) ],
        moduleSpecifier: OperationIdToParameterClassImportPath(getRootOperationId),
      });
      return tsMorphTransform!(project, sourceFile, classDeclaration);
    },
  });
}
