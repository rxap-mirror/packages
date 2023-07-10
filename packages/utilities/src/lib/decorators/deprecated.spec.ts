import { Deprecated } from './deprecated';

describe('@rxap/utilities', () => {

  describe('decorators', () => {

    describe('@Deprecated', () => {

      class MyClass {

        @Deprecated('use username instate')
        public name!: string;

        @Deprecated('use birthday instate')
        public age = 42;

        public myValue = 'test';

        @Deprecated('use loadUser() instate')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public loadPerson(): void {
        }

        @Deprecated('use getUser() instate')
        public getPerson(): any {
          return {id: 'user'};
        }

        @Deprecated('use testMe() instate')
        public testThis(): any {
          return this.myValue;
        }

      }

      let myClass: MyClass;

      beforeEach(() => {
        myClass = new MyClass();
      });

      it('should print warning if deprecated property is accessed', () => {

        const consoleWarnSpy = jest.spyOn(console, 'warn');

        expect(myClass.name).toBeUndefined();

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.name:get] is deprecated!', 'use username instate');
        consoleWarnSpy.mockReset();

        myClass.name = 'my-name';

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.name:set] is deprecated!', 'use username instate');
        consoleWarnSpy.mockReset();

        expect(myClass.name).toEqual('my-name');

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.name:get] is deprecated!', 'use username instate');

      });

      it.skip('should print warning if deprecated property is accessed', () => {

        const consoleWarnSpy = jest.spyOn(console, 'warn');

        expect(myClass.age).toEqual(42);

        consoleWarnSpy.mock.calls;//??

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.age:get] is deprecated!', 'use birthday instate');
        consoleWarnSpy.mockReset();

        myClass.age = 0;

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.age:set] is deprecated!', 'use birthday instate');
        consoleWarnSpy.mockReset();

        expect(myClass.age).toEqual(0);

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.age:get] is deprecated!', 'use birthday instate');

      });

      it.skip('should print warning if deprecated method is called', () => {

        const consoleWarnSpy = jest.spyOn(console, 'warn');

        myClass.loadPerson();

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.loadPerson()] is deprecated!', 'use loadUser() instate');

      });

      it.skip('should print warning if deprecated method with return is called', () => {

        const consoleWarnSpy = jest.spyOn(console, 'warn');

        expect(myClass.getPerson()).toEqual({id: 'user'});

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.getPerson()] is deprecated!', 'use getUser() instate');

      });

      it.skip('should preserve method this context', () => {

        const consoleWarnSpy = jest.spyOn(console, 'warn');

        expect(myClass.testThis()).toEqual('test');

        expect(consoleWarnSpy).toBeCalledTimes(1);
        expect(consoleWarnSpy).toBeCalledWith('[MyClass.testThis()] is deprecated!', 'use testMe() instate');

      });

    });

  });

});
