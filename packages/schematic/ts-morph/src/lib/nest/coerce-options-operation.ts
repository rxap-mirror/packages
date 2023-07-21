import { Rule } from '@angular-devkit/schematics';
import { joinWithDash } from '@rxap/utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { WriteType } from '../ts-morph/write-type';
import { FormDefinitionControl } from '../types/form-definition-control';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceOptionsOperationRuleOptions extends CoerceOperationOptions {
  control: Required<FormDefinitionControl>;
  responseDtoName?: string;
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
      } = CoerceDtoClass({
        project,
        name: responseDtoName!,
        propertyList: [
          {
            name: 'display',
            type: 'string',
          },
          {
            name: 'value',
            type: WriteType(control),
          },
        ],
      });

      CoerceImports(sourceFile, {
        namedImports: [ className ],
        moduleSpecifier: filePath,
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'plainToInstance' ],
        moduleSpecifier: 'class-transformer',
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'classTransformOptions' ],
        moduleSpecifier: '@rxap/nest-utilities',
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
