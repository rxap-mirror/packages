import { CoercePrefix } from './coerce-prefix';

describe('Utilities', () => {

  describe('Strings', () => {

    describe('CoercePrefix', () => {

      it('should add prefix if not present', () => {

        expect(CoercePrefix('value', 'Prefix')).toEqual('Prefixvalue');

      });

      it('should not add prefix if already present', () => {

        expect(CoercePrefix('Prefixvalue', 'Prefix')).toEqual('Prefixvalue');

      });

    });

  });

});
