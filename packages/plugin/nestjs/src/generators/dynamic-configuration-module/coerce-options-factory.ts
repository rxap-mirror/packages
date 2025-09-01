import {
  CoerceClass,
  CoerceClassMethod,
  CoerceDependencyInjection,
  CoerceImports,
  CoerceSourceFile,
  Module,
} from '@rxap/ts-morph';
import {
  dasherize,
  underscore,
} from '@rxap/utilities';
import {
  Project,
  Scope,
} from 'ts-morph';

export function coerceOptionsFactory(project: Project, moduleName: string) {

  const optionsFactoryFileName = `${ dasherize(moduleName) }-options.factory.ts`;
  const sourceFile = CoerceSourceFile(project, optionsFactoryFileName);
  const optionsFactoryClassName = `${ moduleName }OptionsFactory`;
  const optionsInterfaceName = `${ moduleName }Options`;
  const factoryClass = CoerceClass(sourceFile, optionsFactoryClassName, {
    implements: [ `ConfigurableModuleOptionsFactory<${optionsInterfaceName}, 'create'>`],
    isExported: true,
    decorators: [
      {
        name: 'Injectable',
        arguments: []
      }
    ]
  });
  CoerceImports(sourceFile, [
    {
      namedImports: [optionsInterfaceName],
      moduleSpecifier: `./${dasherize(moduleName)}-options`
    },
    {
      namedImports: [
        'ConfigurableModuleOptionsFactory',
        'Inject',
        'Injectable',
        'Logger'
      ],
      moduleSpecifier: '@nestjs/common'
    },
    {
      namedImports: [
        'ConfigService'
      ],
      moduleSpecifier: '@nestjs/config'
    }
  ]);

  const disabledConfigName = underscore(moduleName.replace('Module', '') + 'Disabled').toUpperCase();
  CoerceDependencyInjection(sourceFile, {
    injectionToken: 'ConfigService',
    parameterName: 'config',
    scope: Scope.Private,
    module: Module.NEST,
  });
  CoerceDependencyInjection(sourceFile, {
    injectionToken: 'Logger',
    parameterName: 'logger',
    scope: Scope.Private,
    module: Module.NEST,
  });
  CoerceClassMethod(factoryClass, 'create', {
    returnType: `Promise<${optionsInterfaceName}>`,
    isAsync: true,
    statements: [ `return { disabled: this.config.get('${disabledConfigName}', false) }`]
  });

}
