import { IterateOverPropertyPaths } from './property-path.iterator';

describe('PropertyPathIterator', () => {

  it('simple object', () => {

    const result: Array<[ string, unknown ]> = [];

    for (const item of IterateOverPropertyPaths({ a: 'value', b: 0, c: true, d: null, e: false, f: '', g: undefined, h: 42 })) {
      result.push(item);
    }

    expect(result).toEqual([
      [ 'a', 'value' ],
      [ 'b', 0 ],
      [ 'c', true ],
      [ 'd', null ],
      [ 'e', false ],
      [ 'f', '' ],
      [ 'g', undefined ],
      [ 'h', 42 ]
    ]);

  });

  it('simple array', () => {

    const result: Array<[ string, unknown ]> = [];

    for (const item of IterateOverPropertyPaths([null, undefined, 0, 42, true, false, '', 'value'])) {
      result.push(item);
    }

    expect(result).toEqual([
      [ '0', null ],
      [ '1', undefined ],
      [ '2', 0 ],
      [ '3', 42 ],
      [ '4', true ],
      [ '5', false ],
      [ '6', '' ],
      [ '7', 'value' ],
    ]);

  })

  it('nested object', () => {

    const result: Array<[ string, unknown ]> = [];

    for (const item of IterateOverPropertyPaths({
      a: { a1: '', a2: true },
      b: 'value',
      c: { c1: { c11: 'value' } }
    })) {
      result.push(item);
    }

    expect(result).toEqual([
      [ 'a', { a1: '', a2: true } ],
      [ 'a.a1', '' ],
      [ 'a.a2', true ],
      [ 'b', 'value' ],
      [ 'c', { c1: { c11: 'value' } } ],
      [ 'c.c1', { c11: 'value' } ],
      [ 'c.c1.c11', 'value' ],
    ]);

  })

  it('nested array', () => {

    const result: Array<[ string, unknown ]> = [];

    for (const item of IterateOverPropertyPaths([ 'value', { a: 'value', b: { b1: true }, c: [false] }, [ true, [ 'value' ] ] ])) {
      result.push(item);
    }

    expect(result).toEqual([
      [ '0', 'value' ],
      [ '1', { a: 'value', b: { b1: true }, c: [false] } ],
      [ '1.a', 'value' ],
      [ '1.b', { b1: true } ],
      [ '1.b.b1', true ],
      [ '1.c', [false]  ],
      [ '1.c.0', false  ],
      [ '2', [ true, [ 'value' ] ] ],
      [ '2.0', true ],
      [ '2.1', [ 'value' ] ],
      [ '2.1.0', 'value' ],
    ]);

  })

})
