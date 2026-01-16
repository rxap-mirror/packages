import {
  AbstractControlRolls,
  BackendTypes,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { UpstreamOptionsKinds } from '@rxap/ts-morph';
import { NormalizeTableSelectFormControlOptions } from './normalize-table-select-form-control-options';
import { AutocompleteTableSelectFormControlOptions } from './schema';

describe('NormalizeTableSelectFormControlOptions', () => {
  it('should normalize minimal table select form control options', () => {
    const options: AutocompleteTableSelectFormControlOptions = {
      name: 'test-ats',
      project: 'ui-lib',
      kind: FormControlKinds.TABLE_SELECT,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
      columnList: [ { name: 'col1' } ],
    };
    expect(NormalizeTableSelectFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex table select form control options', () => {
    const options: AutocompleteTableSelectFormControlOptions = {
      name: 'userSelect',
      project: 'ui-lib',
      kind: FormControlKinds.TABLE_SELECT,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
      columnList: [
        { name: 'uuid', hasFilter: true },
        { name: 'name', hasFilter: true },
      ],
      backend: { kind: BackendTypes.NESTJS },
      toDisplay: { property: { name: 'name' } },
      toValue: { property: { name: 'uuid' } },
      upstream: { kind: UpstreamOptionsKinds.OPEN_API, operationId: 'user-controller-getAll' },
    };
    expect(NormalizeTableSelectFormControlOptions(options)).toMatchSnapshot();
  });
});
