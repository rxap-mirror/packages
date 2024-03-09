import {
  CoerceClass,
  CoerceImports,
  CoerceSourceFile,
} from '@rxap/ts-morph';
import {
  camelize,
  classify,
  CoerceSuffix,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import { TsMorphAngularProjectTransformRule } from '../ts-morph-transform';

export interface CoercePipeOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  shared?: boolean;
  valueType?: string;
  pure?: boolean;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoercePipe(options: CoercePipeOptions) {

  const {
          name,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          tsMorphTransform = () => {
          },
          pure,
          valueType        = 'any',
        }               = options;
  const className       = classify(CoerceSuffix(name, 'Pipe'));
  const moduleClassName = classify(CoerceSuffix(name, 'PipeModule'));
  const fileName        = CoerceSuffix(name, '.pipe.ts');
  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, fileName);

    const classDeclaration = CoerceClass(sourceFile, className, {
      isExported: true,
      decorators: [
        {
          name: 'Pipe',
          arguments: [ Writers.object({
            name: w => w.quote(camelize(name)),
            pure: pure ? 'true' : 'false',
            standalone: 'true',
          }) ],
        },
      ],
      implements: [ 'PipeTransform' ],
      methods: [
        {
          name: 'transform',
          parameters: [ {name: 'value', type: valueType} ],
          statements: [
            'return value;',
          ],
        },
      ],
    });

    CoerceClass(sourceFile, moduleClassName, {
      isExported: true,
      decorators: [
        {
          name: 'NgModule',
          arguments: [
            Writers.object({
              imports: `[${ className }]`,
              exports: `[${ className }]`,
            }),
          ],
        },
      ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'NgModule', 'Pipe', 'PipeTransform' ],
    });
    tsMorphTransform(project, sourceFile, classDeclaration);


  });
}
