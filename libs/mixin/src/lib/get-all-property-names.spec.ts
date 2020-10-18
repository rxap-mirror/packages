import { GetAllPropertyNames } from './get-all-property-names';

describe('@rxap/mixin', () => {

  describe('GetAllPropertyNames', () => {

    class Root {

      public get name(): string {
        return '';
      }

      public getRoot() {}

    }

    it('should return all property names from the class', () => {

      expect(GetAllPropertyNames(Root.prototype)).toEqual([ 'constructor', 'name', 'getRoot' ]);
      expect(GetAllPropertyNames(Root.prototype)).toEqual(Object.getOwnPropertyNames(Root.prototype));

    });

    it('should return all property names from the class and the parent class', () => {

      class Child extends Root {

        public get username(): string {
          return '';
        }

        public getChild() {}

      }

      expect(GetAllPropertyNames(Child.prototype)).toEqual([ 'constructor', 'username', 'getChild', 'name', 'getRoot' ]);

    });

  });

});
