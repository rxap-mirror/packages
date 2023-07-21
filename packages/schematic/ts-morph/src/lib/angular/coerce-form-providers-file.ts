import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceFunction } from '../ts-morph/coerce-function';
import { Writers } from 'ts-morph';
import { CoerceFormBuilderProvider } from './coerce-form-builder-provider';
import { CoerceFormProvider } from './coerce-form-provider';
import { CoerceFormComponentProvider } from './coerce-form-component-provider';
import { CoerceStatements } from '../ts-morph/coerce-statements';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceFormProvidersFileOptions {
  project: string;
  feature: string;
  directory?: string;
  name: string;
}

export function CoerceFormProvidersFile(options: Readonly<CoerceFormProvidersFileOptions>) {
  const { name } = options;
  const className = CoerceSuffix(classify(name), 'Form');
  const interfaceName = `I${ className }`;

  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, '/form.providers.ts');

    CoerceFormProvider(sourceFile, className);
    CoerceFormComponentProvider(sourceFile, {
      provide: 'RXAP_FORM_DEFINITION',
      useFactory: 'FormFactory',
      deps: [ 'INJECTOR', '[ new Optional(), RXAP_FORM_INITIAL_STATE ]' ],
    });
    CoerceFormBuilderProvider(sourceFile, {
      provide: 'RXAP_FORM_DEFINITION_BUILDER',
      useFactory: 'FormBuilderFactory',
      deps: [ 'INJECTOR' ],
    });
    const formFactoryFunctionDeclaration = CoerceFunction(sourceFile, 'FormFactory', {
      parameters: [
        {
          name: 'injector',
          type: 'Injector',
        },
        {
          name: 'state',
          type: Writers.unionType(interfaceName, 'null'),
        },
      ],
      returnType: className,
      isExported: true,
    });
    CoerceStatements(formFactoryFunctionDeclaration, [
      `return new RxapFormBuilder<${ interfaceName }>(${ className }, injector).build(state ?? {});`,
    ]);
    const formBuilderFactoryDeclaration = CoerceFunction(sourceFile, 'FormBuilderFactory', {
      parameters: [
        {
          name: 'injector',
          type: 'Injector',
        },
      ],
      returnType: `RxapFormBuilder<${ className }>`,
    });
    CoerceStatements(formBuilderFactoryDeclaration, [
      `return new RxapFormBuilder<${ interfaceName }>(${ className }, injector);`,
    ]);
    CoerceImports(sourceFile, {
      namedImports: [ className, interfaceName ],
      moduleSpecifier: `./${ name }.form`,
    });
    CoerceImports(sourceFile, {
      namedImports: [
        'INJECTOR',
        'Injector',
        'Optional',
      ],
      moduleSpecifier: '@angular/core',
    });
    CoerceImports(sourceFile, {
      namedImports: [
        'RxapFormBuilder',
        'RXAP_FORM_DEFINITION_BUILDER',
        'RXAP_FORM_DEFINITION',
        'RXAP_FORM_INITIAL_STATE',
      ],
      moduleSpecifier: '@rxap/forms',
    });

  });
}
