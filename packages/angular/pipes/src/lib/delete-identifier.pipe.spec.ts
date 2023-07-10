import { DeleteIdentifierPipe } from './delete-identifier.pipe';

describe('@rxap/pipes', () => {

  describe('DeleteIdentifierPipe', () => {

    it('create an instance', () => {
      const pipe = new DeleteIdentifierPipe();
      expect(pipe).toBeTruthy();
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
