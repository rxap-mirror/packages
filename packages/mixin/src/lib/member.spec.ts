import {Mixin} from './mixin';
import {Member, MemberFactory} from './member';
import {GetPropertyDescriptor} from './get-property-descriptor';

describe('@rxap/mixin', () => {

  describe('@Member', () => {

    it('should mix in members', () => {

      class MyMixin {

        @Member(true)
        public disabled!: boolean;

        @Member(false)
        public active!: boolean;

      }

      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      interface Concrete extends MyMixin {
      }

      @Mixin(MyMixin)
      class Concrete {

      }

      class ConcreteChild extends Concrete {
      }

      const concrete = new Concrete();
      const concreteChild = new ConcreteChild();

      expect(GetPropertyDescriptor(concrete, 'disabled')).toHaveProperty('get');
      expect(GetPropertyDescriptor(concrete, 'disabled')).toHaveProperty('set');
      expect(GetPropertyDescriptor(concreteChild, 'disabled')).toHaveProperty('get');
      expect(GetPropertyDescriptor(concreteChild, 'disabled')).toHaveProperty('set');
      expect(GetPropertyDescriptor(concrete, 'active')).toHaveProperty('get');
      expect(GetPropertyDescriptor(concrete, 'active')).toHaveProperty('set');
      expect(GetPropertyDescriptor(concreteChild, 'active')).toHaveProperty('get');
      expect(GetPropertyDescriptor(concreteChild, 'active')).toHaveProperty('set');

      expect(concrete.disabled).toBeTruthy();
      expect(concreteChild.disabled).toBeTruthy();
      expect(Object.getOwnPropertyDescriptor(concrete, 'disabled')).toEqual({
        configurable: true,
        enumerable: true,
        value: true,
        writable: true,
      });
      expect(Object.getOwnPropertyDescriptor(concreteChild, 'disabled')).toEqual({
        configurable: true,
        enumerable: true,
        value: true,
        writable: true,
      });

      concrete.active = true;
      concreteChild.active = true;

      expect(concrete.active).toBeTruthy();
      expect(concreteChild.active).toBeTruthy();
      expect(Object.getOwnPropertyDescriptor(concrete, 'active')).toEqual({
        configurable: true,
        enumerable: true,
        value: true,
        writable: true,
      });
      expect(Object.getOwnPropertyDescriptor(concreteChild, 'active')).toEqual({
        configurable: true,
        enumerable: true,
        value: true,
        writable: true,
      });


    });

  });

  describe('@MemberFactory', () => {

    it('should call member value factory with this as first parameter', () => {

      const initialFactorySpy = jest.fn().mockResolvedValue(true);

      class MyMixin {

        @MemberFactory(initialFactorySpy)
        public disabled!: boolean;

      }

      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      interface Concrete extends MyMixin {
      }

      @Mixin(MyMixin)
      class Concrete {

      }

      const concrete = new Concrete();

      expect(concrete.disabled).toBeTruthy();
      expect(initialFactorySpy).toBeCalledTimes(1);
      expect(initialFactorySpy).toBeCalledWith(concrete);

      concrete.disabled = false;
      expect(concrete.disabled).toBeFalsy();
      // the initial factory should only be called once
      expect(initialFactorySpy).toBeCalledTimes(1);

    });

    it('should create instance isolated member property instance', () => {

      class MyClass {
      }

      function MyClassFactory() {
        return new MyClass();
      }

      const myClassFactorySpy = jest.fn().mockImplementation(MyClassFactory);

      class MyMixin {

        @MemberFactory(myClassFactorySpy)
        public disabled!: MyClass;

      }

      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      interface Concrete extends MyMixin {
      }

      @Mixin(MyMixin)
      class Concrete {

      }

      const concrete1 = new Concrete();
      const concrete2 = new Concrete();
      const concrete3 = new Concrete();

      expect(concrete1.disabled).toBeInstanceOf(MyClass);
      expect(concrete2.disabled).toBeInstanceOf(MyClass);
      expect(concrete3.disabled).toBeInstanceOf(MyClass);

      expect(myClassFactorySpy).toBeCalledTimes(3);

      expect(concrete1.disabled).not.toBe(concrete2.disabled);
      expect(concrete3.disabled).not.toBe(concrete2.disabled);

    });

  });

});
