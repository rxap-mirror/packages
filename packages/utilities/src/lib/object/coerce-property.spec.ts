import { CoerceProperty } from './coerce-property';

describe('@rxap/utilities', () => {

  describe('object', () => {

    describe('CoerceProperty', () => {

      it('should add property', () => {

        const obj: any = {};

        CoerceProperty(obj, 'path0', {});

        expect(obj.path0).toBeDefined();

      });

      it('should add sub property', () => {

        const obj: any = {};

        CoerceProperty(obj, 'path0.path1', {});

        expect(obj.path0.path1).toBeDefined();

      });

    });

  });

});
