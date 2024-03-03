import { Rule } from '@angular-devkit/schematics';
import { dasherize } from '@rxap/schematics-utilities';
import {
  ControlOption,
  ControlOptions,
} from '@rxap/utilities';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';
import { TsMorphAngularProjectTransformOptions } from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDataSourceClass } from './coerce-data-source-class';

export interface CoerceOptionsDataSourceRuleOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  optionList: ReadonlyArray<ControlOption>;
}

export function CoerceOptionsDataSourceRule(options: Readonly<CoerceOptionsDataSourceRuleOptions>): Rule {
  const {
    name,
    project,
    feature,
    directory,
    shared,
    optionList,
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
            data: w => {
              w.write('[');
              for (const option of optionList) {
                const obj: Record<string, string | WriterFunction> = {};
                obj['value'] = option.value;
                obj['display'] = w => w.quote(option.display);
                if (typeof option.disabled === 'boolean') {
                  obj['disabled'] = option.disabled ? 'true' : 'false';
                }
                if (option.color) {
                  obj['color'] = w => w.quote(option.color!);
                }
                if (typeof option.default === 'boolean') {
                  obj['default'] = option.default ? 'true' : 'false';
                }
                if (option.i18n) {
                  obj['i18n'] = w => w.quote(option.i18n!);
                }
                Writers.object(obj)(w);
                w.write(',');
              }
              w.write(']');
              if (!optionList.length) {
                w.write(' as ControlOptions');
                CoerceImports(sourceFile, {
                  namedImports: ['ControlOptions'],
                  moduleSpecifier: '@rxap/utilities',
                });
              }
            },
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
