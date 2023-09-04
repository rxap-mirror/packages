import { RemoveFromObject } from './remove-from-object';

describe('RemoteFromObject', () => {

  it('should remove a key from an object', () => {
    const obj = { a: 1 };
    RemoveFromObject(obj, 'a');
    expect(obj).toEqual({});
  });

  it('should only remove the defined key from an object', () => {
    const obj = {
      a: 1,
      b: 2,
    };
    RemoveFromObject(obj, 'a');
    expect(obj).toEqual({ b: 2 });
  });

  it('should remove a key from a nested object', () => {
    const obj = {
      a: { value: 'test' },
      b: 2,
    };
    RemoveFromObject(obj, 'a.value');
    expect(obj)
      .toEqual({
        a: {},
        b: 2,
      });
  });

  it('should handle a path that does not exist', () => {
    const obj = {
      a: { value: 'test' },
      b: 2,
    };
    RemoveFromObject(obj, 'c.value');
    expect(obj)
      .toEqual({
        a: { value: 'test' },
        b: 2,
      });
  });

  it('should handle a path that does not exist partial', () => {
    const obj = {
      a: { value: 'test' },
      b: 2,
    };
    RemoveFromObject(obj, 'a.text');
    expect(obj)
      .toEqual({
        a: { value: 'test' },
        b: 2,
      });
  });

});
