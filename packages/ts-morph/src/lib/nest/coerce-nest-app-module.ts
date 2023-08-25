import { SourceFile } from 'ts-morph';
import {
  CoerceNestModule,
  CoerceNestModuleOptions,
} from './coerce-nest-module';
import { RemoveNestModuleProvider } from './remove-nest-module-provider';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CoerceNestAppModuleOptions extends Omit<CoerceNestModuleOptions, 'name'> {

}

export function CoerceNestAppModule(sourceFile: SourceFile, options: CoerceNestAppModuleOptions = {}) {
  CoerceNestModule(sourceFile, {
    ...options,
    name: 'app',
  });
  sourceFile.getImportDeclaration('./app.service')?.remove();
  RemoveNestModuleProvider(sourceFile, 'AppService');
}
