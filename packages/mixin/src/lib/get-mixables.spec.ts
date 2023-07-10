import { getMixables } from './get-mixables';
import { Overwrite } from './overwrite';

describe('Mixin', () => {

  describe('getMixables', () => {

    describe('with class', () => {

      it('should only return property descriptors that are not included in the clientKeys array', () => {

        class MyMixin {

          public get fullName() {
            return this.name;
          }

          public set fullName(name: string) {
            this.name = name;
          }

          public set firstName(name: string) {
            this.name = name;
          }

          public get lastName() {
            return this.name;
          }

          public name = 'name';

          public getName() {
          }

        }

        expect(Object.keys(getMixables(class {
          constructor() {
          }
        }, MyMixin))).toEqual([
          'fullName',
          'firstName',
          'lastName',
          'getName',
        ]);

        expect(Object.keys(getMixables(class {
          constructor() {
          }

          test() {
          }
        }, MyMixin))).toEqual([
          'fullName',
          'firstName',
          'lastName',
          'getName',
        ]);

        expect(Object.keys(getMixables(class {
          set firstName(v: any) {
          }

          constructor() {
          }

          test() {
          }
        }, MyMixin))).toEqual([
          'fullName',
          'lastName',
          'getName',
        ]);

      });

      it('mixin with overwrite properties', () => {

        class MyMixin {

          @Overwrite()
          public getOnlySelf() {
          }

          @Overwrite(false)
          public getAll() {
          }

          @Overwrite()
          public getSelf() {
          }

          @Overwrite(false)
          public getSelfAll() {
          }

        }

        class Parent {

          public getAll() {
          }

          public getOnlySelf() {
          }

          public getSelf() {
          }

        }

        class Child extends Parent {

          public override getSelf() {
          }

          public getSelfAll() {
          }

        }

        expect(Object.keys(getMixables(Child, MyMixin))).toEqual([
          'getOnlySelf',
          'getAll',
          'getSelfAll',
        ]);

      });

    });

  });

});
