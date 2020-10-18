import { joinPath } from './join';

describe('Utilities', () => {

  describe('Join', () => {

    describe('Join Path', () => {

      it('fragments without tailing slashes', () => {

        const fragments = [
          'http://rxap.dev',
          'users',
          'accounts'
        ];

        expect(joinPath(...fragments)).toEqual('http://rxap.dev/users/accounts');

      });

      it('fragments with tailing slashes', () => {

        const fragments = [
          'http://rxap.dev/',
          'users/',
          '//accounts'
        ];

        expect(joinPath(...fragments)).toEqual('http://rxap.dev/users/accounts');

      });

      it('should remove any tailing slashes', () => {

        const fragments = [
          'http://rxap.dev/',
          'users//',
          '/accounts/'
        ];

        expect(joinPath(...fragments)).toEqual('http://rxap.dev/users/accounts');

      });

      it('should remove any single slashes', () => {

        const fragments = [
          'http://rxap.dev/',
          'users/',
          '/',
          '/accounts/',
          '/'
        ];

        expect(joinPath(...fragments)).toEqual('http://rxap.dev/users/accounts');

      });

    });

  });

});
