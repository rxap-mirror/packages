import { Rule } from '@angular-devkit/schematics';
import { FormArrayKind } from '@rxap/schematic-angular';
import { NormalizedFormArrayOptions } from './normalize-form-array-options';

export function formControlKind(normalizedOptions: NormalizedFormArrayOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormArrayKind.DEFAULT:
    default:
      return () => console.log(`No schematic for form array kind: ${ normalizedOptions.kind }`.yellow);

  }
}