import { CoerceSuffix } from './coerce-suffix';

describe('Utilities', () => {

  describe('Strings', () => {

    describe('CoerceSuffix', () => {

      it('should add suffix if not present', () => {

        expect(CoerceSuffix('value', 'Suffix')).toEqual('valueSuffix');

      });

      it('should not add suffix if already present', () => {

        expect(CoerceSuffix('valueSuffix', 'Suffix')).toEqual('valueSuffix');

      });

      it('should only add a prefix of the suffix if the input has already a partial suffix', () => {

        expect(CoerceSuffix('valueInfix', 'InfixSuffix')).toEqual('valueInfixSuffix');

      });

    });

  });

});
