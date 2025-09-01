import {
  CoerceClassMethod,
  CoerceDecorator,
  CoerceImports,
  IsNestModuleClass,
} from '@rxap/ts-morph';
import {
  dasherize,
  underscore,
} from '@rxap/utilities';
import {
  Scope,
  SourceFile,
} from 'ts-morph';

export function coerceDynamicModule(sourceFile: SourceFile, isGlobal = true) {

  const moduleClass = sourceFile.getClass(IsNestModuleClass);
  if (!moduleClass) {
    throw new Error('No nest module class found');
  }
  const optionsName = moduleClass.getName() + 'Options';

  if (!sourceFile.getFullText().includes('new ConfigurableModuleBuilder')) {
    sourceFile.insertStatements(sourceFile.getImportDeclarations().reverse()[0].getChildIndex() + 1, `export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<${optionsName}>()
  .setExtras({ global: ${isGlobal ? 'true' : 'false'} })
  .build();`);
    CoerceImports(sourceFile, [
      {
        namedImports: ['ConfigurableModuleBuilder'],
        moduleSpecifier: '@nestjs/common'
      }
    ]);
  }

  CoerceImports(sourceFile, [
    {
      namedImports: [optionsName],
      moduleSpecifier: `./${dasherize(optionsName)}`
    }
  ]);


  if (isGlobal) {
    CoerceDecorator(moduleClass, 'Global', { arguments: [] });
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'Global', 'DynamicModule' ],
        moduleSpecifier: '@nestjs/common'
      }
    ]);
  }

  if (!moduleClass.getExtends()) {
    moduleClass.setExtends('ConfigurableModuleClass');
  }

  CoerceClassMethod(moduleClass, 'register', {
    isStatic: true,
    parameters: [
      {
        name: 'options',
        type: 'typeof OPTIONS_TYPE',
      }
    ],
    returnType: 'DynamicModule',
    statements: [
      'return this.updateProviders(super.register(options));'
    ]
  });

  CoerceClassMethod(moduleClass, 'registerAsync', {
    isStatic: true,
    parameters: [
      {
        name: 'options',
        type: 'typeof ASYNC_OPTIONS_TYPE',
      }
    ],
    returnType: 'DynamicModule',
    statements: [
      'return this.updateProviders(super.registerAsync(options));'
    ]
  });

  const optionsToken = underscore(optionsName).toUpperCase();
  CoerceClassMethod(moduleClass, 'updateProviders', {
    scope: Scope.Private,
    isStatic: true,
    parameters: [
      {
        name: 'module',
        type: 'DynamicModule',
      }
    ],
    statements: [
      `module.providers ??= [];
module.providers.push({
  provide: ${optionsToken},
  useExisting: MODULE_OPTIONS_TOKEN,
});
return module;`
    ]
  });

  CoerceImports(sourceFile, [
    {
      namedImports: [optionsToken],
      moduleSpecifier: `./tokens`
    }
  ]);

  return moduleClass;

}
