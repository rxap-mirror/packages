import { isTeardownLogic } from './is-teardown-logic';
import { Subscription } from 'rxjs';


describe('Utilities', () => {

  describe('Is Teardown Logic', () => {

    it('should return false if null, undefined or void', () => {

      expect(isTeardownLogic(null)).toBeFalsy();
      expect(isTeardownLogic(undefined)).toBeFalsy();
      expect(isTeardownLogic(void 0)).toBeFalsy();

    });

    it('should return true if Subscription', () => {

      expect(isTeardownLogic(new Subscription())).toBeTruthy();

    });

    it('should return true if TeardownLogic', () => {

      expect(isTeardownLogic({ unsubscribe: () => {} })).toBeTruthy();
      expect(isTeardownLogic(() => {})).toBeTruthy();

    });

  });

});
