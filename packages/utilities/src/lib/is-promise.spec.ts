import {
  isPromise,
  isPromiseLike,
} from './is-promise';

describe('Utilities', () => {

  describe('Is Promise', () => {

    it('should return false if null, undefined or void', () => {

      expect(isPromise(null)).toBeFalsy();
      expect(isPromise(undefined)).toBeFalsy();
      expect(isPromise(void 0)).toBeFalsy();

    });

    it('should return true if Promise', () => {

      expect(isPromise(Promise.resolve())).toBeTruthy();

    });

    it('should return false if PromiseLike', () => {

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(isPromise({
        then: () => {
        },
      })).toBeFalsy();

    });

  });

  describe('Is Promise Like', () => {

    it('should return false if null, undefined or void', () => {

      expect(isPromiseLike(null)).toBeFalsy();
      expect(isPromiseLike(undefined)).toBeFalsy();
      expect(isPromiseLike(void 0)).toBeFalsy();

    });

    it('should return true if Promise', () => {

      expect(isPromiseLike(Promise.resolve())).toBeTruthy();

    });

    it('should return true if PromiseLike', () => {

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(isPromiseLike({
        then: () => {
        },
      })).toBeTruthy();

    });

  });

});
