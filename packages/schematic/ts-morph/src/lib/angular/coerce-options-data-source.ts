import { TsMorphAngularProjectTransformOptions } from '../ts-morph-transform';
import { Rule } from '@angular-devkit/schematics';
import { CoerceDataSourceClass } from './coerce-data-source-class';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { Writers } from 'ts-morph';
import { dasherize } from '@rxap/schematics-utilities';

export interface CoerceOptionsDataSourceRuleOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
}

export function CoerceOptionsDataSourceRule(options: Readonly<CoerceOptionsDataSourceRuleOptions>): Rule {
  const {
    name,
    project,
    feature,
    directory,
    shared,
  } = options;
  return CoerceDataSourceClass({
    project,
    feature,
    directory,
    shared,
    name,
    coerceExtends: (sourceFile, classDeclaration, options) => {
      classDeclaration.setExtends(`StaticDataSource<ControlOptions>`);
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/data-source',
          namedImports: [ 'StaticDataSource' ],
        },
        {
          moduleSpecifier: '@rxap/utilities',
          namedImports: [ 'ControlOptions' ],
        },
      ]);
    },
    coerceDecorator: (sourceFile, classDeclaration, options) => {
      CoerceDecorator(classDeclaration, 'RxapStaticDataSource', {
        arguments: [
          Writers.object({
            id: w => w.quote(dasherize(name)),
            data: '[]',
          }),
        ],
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/data-source',
        namedImports: [ 'RxapStaticDataSource' ],
      });
    },
  });
}
