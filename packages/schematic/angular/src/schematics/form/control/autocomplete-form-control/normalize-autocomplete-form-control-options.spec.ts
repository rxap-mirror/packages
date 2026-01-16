import {
  AbstractControlRolls,
  BackendTypes,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { UpstreamOptionsKinds } from '@rxap/ts-morph';
import { NormalizeAutocompleteFormControlOptions } from './normalize-autocomplete-form-control-options';
import { AutocompleteFormControlOptions } from './schema';

describe('NormalizeAutocompleteFormControlOptions', () => {
  it('should normalize minimal autocomplete form control options', () => {
    const options: AutocompleteFormControlOptions = {
      name: 'test-auto',
      project: 'ui-lib',
      kind: FormControlKinds.AUTOCOMPLETE,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
    };
    expect(NormalizeAutocompleteFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex autocomplete form control options', () => {
    const options: AutocompleteFormControlOptions = {
      name: 'country',
      project: 'ui-lib',
      kind: FormControlKinds.AUTOCOMPLETE,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
      toDisplay: {
        property: {
          name: 'name',
        },
      },
      toValue: {
        property: {
          name: 'code',
        },
      },
      backend: {
        kind: BackendTypes.NESTJS,
      },
      upstream: {
        kind: UpstreamOptionsKinds.OPEN_API,
        operationId: 'country-controller-getAll',
      },
      resolver: {
        upstream: {
          kind: UpstreamOptionsKinds.OPEN_API,
          operationId: 'country-controller-getOne',
        },
      },
    };
    expect(NormalizeAutocompleteFormControlOptions(options)).toMatchSnapshot();
  });
});
