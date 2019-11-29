import { IsNotEmptySubscriber } from '@rxap/utilities';
import { Subscriber } from 'rxjs';
import Spy = jasmine.Spy;

describe('Utilities', () => {

  describe('Rxjs', () => {

    describe('is not empty', () => {

      let isNotEmptySubscriber: IsNotEmptySubscriber<any>;
      let subscriber: Subscriber<any>;
      let nextSpy: Spy;
      let errorSpy: Spy;

      beforeEach(() => {
        subscriber           = new Subscriber<any>();
        isNotEmptySubscriber = new IsNotEmptySubscriber<any>(subscriber);
        nextSpy              = spyOn(subscriber, 'next');
        errorSpy             = spyOn(subscriber, 'error');
      });

      it('should not call next or error for an empty string', () => {

        expect(nextSpy).not.toBeCalled();
        expect(errorSpy).not.toBeCalled();

        isNotEmptySubscriber._next('');

        expect(nextSpy).not.toBeCalled();
        expect(errorSpy).not.toBeCalled();

      });

      it('should call next and not error for a not empty string', () => {

        expect(nextSpy).not.toBeCalled();
        expect(errorSpy).not.toBeCalled();

        isNotEmptySubscriber._next('string');

        expect(nextSpy).toBeCalled();
        expect(errorSpy).not.toBeCalled();

      });

    });

  });

});
