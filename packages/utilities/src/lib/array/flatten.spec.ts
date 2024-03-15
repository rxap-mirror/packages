import { WithChildren } from '../helpers';
import { flatten } from './flatten';

describe('flatten', () => {
  it('flattens a nested array', () => {
    const input = [{ value: 1, children: [{ value: 2, children: [{ value: 3, children: [] }] }] }];
    const expected = [{ value: 1 }, { value: 2 }, { value: 3 }];

    expect(flatten(input)).toMatchObject(expected);
  });

  it('handles an array with no children', () => {
    const input = [{ value: 1, children: [] }];
    const expected = [{ value: 1 }];

    expect(flatten(input)).toMatchObject(expected);
  });

  it('handles an empty array', () => {
    const input: WithChildren[] = [];
    const expected: WithChildren[] = [];

    expect(flatten(input)).toMatchObject(expected);
  });
});
