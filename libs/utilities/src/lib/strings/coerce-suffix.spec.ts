import { CoerceSuffix } from '@rxap/utilities';

describe('Utilities', () => {

  describe('Strings', () => {

    describe('CoerceSuffix', () => {

      it('should add suffix if not present', () => {

        expect(CoerceSuffix('value', 'Suffix')).toEqual('valueSuffix');

      });

      it('should not add suffix if already present', () => {

        expect(CoerceSuffix('valueSuffix', 'Suffix')).toEqual('valueSuffix');

      });

    });

  });

});
