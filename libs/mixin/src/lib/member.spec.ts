import { Mixin } from './mixin';
import {
  Member,
  MemberFactory
} from './member';
import { GetPropertyDescriptor } from './get-property-descriptor';
import { Subject } from 'rxjs';
import createSpy = jasmine.createSpy;

describe('@rxap/mixin', () => {

  describe('@Member', () => {

    it('should mix in members', () => {

      class MyMixin {

        @Member(true)
        public disabled!: boolean;

        @Member(false)
        public active!: boolean;

      }

      // tslint:disable-next-line:no-empty-interface
      interface Concrete extends MyMixin {}

      @Mixin(MyMixin)
      class Concrete {

      }

      class ConcreteChild extends Concrete {}

      const concrete      = new Concrete();
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
        enumerable:   true,
        value:        true,
        writable:     true
      });
      expect(Object.getOwnPropertyDescriptor(concreteChild, 'disabled')).toEqual({
        configurable: true,
        enumerable:   true,
        value:        true,
        writable:     true
      });

      concrete.active      = true;
      concreteChild.active = true;

      expect(concrete.active).toBeTruthy();
      expect(concreteChild.active).toBeTruthy();
      expect(Object.getOwnPropertyDescriptor(concrete, 'active')).toEqual({
        configurable: true,
        enumerable:   true,
        value:        true,
        writable:     true
      });
      expect(Object.getOwnPropertyDescriptor(concreteChild, 'active')).toEqual({
        configurable: true,
        enumerable:   true,
        value:        true,
        writable:     true
      });


    });

  });

  describe('@MemberFactory', () => {

    it('should call member value factory with this as first parameter', () => {

      const initialFactorySpy = createSpy().and.returnValue(true);

      class MyMixin {

        @MemberFactory(initialFactorySpy)
        public disabled!: boolean;

      }

      // tslint:disable-next-line:no-empty-interface
      interface Concrete extends MyMixin {}

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

      function SubjectFactory() {
        return new Subject();
      }

      const subjectFactorySpy = createSpy().and.callFake(SubjectFactory);

      class MyMixin {

        @MemberFactory(subjectFactorySpy)
        public disabled!: Subject<any>;

      }

      // tslint:disable-next-line:no-empty-interface
      interface Concrete extends MyMixin {}

      @Mixin(MyMixin)
      class Concrete {

      }

      const concrete1 = new Concrete();
      const concrete2 = new Concrete();
      const concrete3 = new Concrete();

      expect(concrete1.disabled).toBeInstanceOf(Subject);
      expect(concrete2.disabled).toBeInstanceOf(Subject);
      expect(concrete3.disabled).toBeInstanceOf(Subject);

      expect(subjectFactorySpy).toBeCalledTimes(3);

      expect(concrete1.disabled).not.toBe(concrete2.disabled);
      expect(concrete3.disabled).not.toBe(concrete2.disabled);

    });

  });

});
