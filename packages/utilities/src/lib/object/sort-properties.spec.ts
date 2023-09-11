import { SortProperties } from './sort-properties';

describe('SortProperties', () => {

  it('should sort properties in place', () => {

    const obj = {
      c: '',
      d: '',
      a: '',
      b: '',
    };

    const m = SortProperties(obj);

    expect(obj)
      .toEqual({
        a: '',
        b: '',
        c: '',
        d: '',
      });
    expect(obj === m).toBeTruthy();

  });

});
