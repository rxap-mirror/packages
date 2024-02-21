import {
  AddComponentProvider,
  CoerceComponentOptions,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceComponentImport,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  classify,
  noop,
} from '@rxap/utilities';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';
import { NormalizedFormComponentOptions } from '../schematics/form/form-component';

export interface CoerceFormComponentOptions extends CoerceComponentOptions {
  form: NormalizedFormComponentOptions;
}

export function CoerceFormComponentRule(options: CoerceFormComponentOptions) {

  const {
    tsMorphTransform = noop,
    form: {
      window,
      name,
      matFormFieldDefaultOptions,
    },
  } = options;


  return CoerceComponentRule({
    ...options,
    tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

      // region angular imports
      CoerceComponentImport(
        classDeclaration, {
          name: 'ReactiveFormsModule',
          moduleSpecifier: '@angular/forms',
        });
      CoerceComponentImport(
        classDeclaration, {
          name: 'FormControlsComponent',
          moduleSpecifier: '@rxap/material-form-system',
        });
      CoerceComponentImport(
        classDeclaration, {
          name: 'RxapFormsModule',
          moduleSpecifier: '@rxap/forms',
        });
      if (window) {
        CoerceComponentImport(
          classDeclaration, {
            name: 'FormWindowFooterDirective',
            moduleSpecifier: '@rxap/form-window-system',
          });
      }
      // endregion

      // region angular providers
      if (window) {
        AddComponentProvider(sourceFile, {
          provide: 'RXAP_WINDOW_SETTINGS',
          useValue: Writers.object({
            title: `$localize\`${ classify(name) }\``,
          }),
        });
        CoerceImports(
          sourceFile,
          {
            namedImports: [ 'RXAP_WINDOW_SETTINGS' ],
            moduleSpecifier: '@rxap/window-system',
          },
        );
        CoerceComponentImport(
          classDeclaration,
          {
            name: 'FormWindowFooterDirective',
            moduleSpecifier: '@rxap/form-window-system',
          }
        );
      }
      if (matFormFieldDefaultOptions) {
        const matOptions: Record<string, string | WriterFunction> = {};
        const { appearance } = matFormFieldDefaultOptions;
        if (appearance) {
          matOptions['appearance'] = w => w.quote(appearance);
        }
        AddComponentProvider(sourceFile, {
          provide: 'MAT_FORM_FIELD_DEFAULT_OPTIONS',
          useValue: Writers.object(matOptions),
        });
        CoerceImports(
          sourceFile,
          {
            namedImports: [ 'MAT_FORM_FIELD_DEFAULT_OPTIONS' ],
            moduleSpecifier: '@angular/material/form-field',
          },
        );
      }
      // endregion

      tsMorphTransform(project, [ sourceFile ], [ classDeclaration ], options);
    },
  });

}
