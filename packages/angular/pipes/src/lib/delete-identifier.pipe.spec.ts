import { DeleteIdentifierPipe } from './delete-identifier.pipe';

describe('@rxap/pipes', () => {

  describe('DeleteIdentifierPipe', () => {

    it('create an instance', () => {
      const pipe = new DeleteIdentifierPipe();
      expect(pipe).toBeTruthy();
    });

    it('should return a falsy value unchanged', () => {
      const pipe = new DeleteIdentifierPipe();
      expect(pipe.transform(null)).toBeNull();
    });

    it('should keep the other properties and not modify the source', () => {
      const pipe = new DeleteIdentifierPipe();
      const source = { id: 'id', name: 'name' };
      expect(pipe.transform(source)).toEqual({ name: 'name' });
      expect(source).toEqual({ id: 'id', name: 'name' });
    });

    it('should delete identifier properties', () => {

      const pipe = new DeleteIdentifierPipe();

      expect(Object.keys(pipe.transform({
        id: 'id',
        __id: '__id',
        _id: '_id',
        key: 'key',
      })!).length).toBe(0);

    });

  });

});
