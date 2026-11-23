import { FormControl } from '@angular/forms';
import { IsComplex } from './is-complex';

describe('IsComplex (combined length options)', () => {

  const run = (options: any, value: any) => IsComplex({ options, message: 'm' })(new FormControl(value));

  it('checks the min and max length independently and reports each result', () => {
    expect(run({ min: 2, max: 4 }, 'ab')).toBeNull();
    expect(run({ min: 2, max: 4 }, 'abcd')).toBeNull();
    expect(run({ min: 2, max: 4 }, 'a')!['isComplex'].actual).toEqual({ min: false, max: true });
    expect(run({ min: 2, max: 4 }, 'abcde')!['isComplex'].actual).toEqual({ min: true, max: false });
  });

});
