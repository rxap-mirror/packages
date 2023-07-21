import { Rule } from '@angular-devkit/schematics';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoerceDtoClass } from './coerce-dto-class';
import { WriteType } from '../ts-morph/write-type';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { joinWithDash } from '@rxap/utilities';
import { FormDefinitionControl } from '../types/form-definition-control';

export interface CoerceOptionsOperationRuleOptions extends CoerceOperationOptions {
  control: Required<FormDefinitionControl>;
}

export function CoerceOptionsOperationRule(options: Readonly<CoerceOptionsOperationRuleOptions>): Rule {
  let {
    responseDtoName,
    control,
    context,
  } = options;
  responseDtoName ??= joinWithDash([ context, control.name, 'options' ]);
  return CoerceOperation({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration, controllerName) => {

      const {
        className,
        filePath,
      } = CoerceDtoClass(project, responseDtoName!, [
        {
          name: 'display',
          type: 'string',
        },
        {
          name: 'value',
          type: WriteType(control),
        },
      ]);

      CoerceImports(sourceFile, {
        namedImports: [ className ],
        moduleSpecifier: `..${ filePath }`,
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'plainToInstance' ],
        moduleSpecifier: 'class-transformer',
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'classTransformOptions' ],
        moduleSpecifier: '@rxap/nest/class-transformer/options',
      });

      return {
        returnType: `Array<${ className }>`,
        statements: [
          'return plainToInstance(',
          className + ',',
          '[],',
          'classTransformOptions',
          ');',
        ],
      };
    },
  });
}
