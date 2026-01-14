import { Rule } from '@angular-devkit/schematics';
import { FormGroupKind } from '@rxap/schematic-angular';
import { NormalizedFormGroupOptions } from './normalize-form-group-options';

export function formControlKind(normalizedOptions: NormalizedFormGroupOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormGroupKind.DEFAULT:
    default:
      return () => console.log(`No schematic for form group kind: ${ normalizedOptions.kind }`.yellow);

  }
}