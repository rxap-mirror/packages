import {of, ReplaySubject, Subject} from 'rxjs';
import { AuthorizationService } from './authorization.service';

describe('@rxap/authorization', () => {

  describe('AuthorizationService', () => {

    describe('checkPermissions', () => {

      const identifiers: string[] = [
        'table.machine.create-button',
        'table.machine.edit',
        'table.connection.create-button',
        'form.machine.name'
      ];

      const scope: string = 'feature.machine';

      let authorization: AuthorizationService;

      beforeEach(() => {

        const method = { call: () => Promise.resolve({}) } as any;
        authorization = new AuthorizationService(method);

      });

      it('permission: *', () => {

        const permissions = ['*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(true);

      });

      it('permission: table.*', () => {

        const permissions = ['table.*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: table.machine.*', () => {

        const permissions = ['table.machine.*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: table.machine.create-button', () => {

        const permissions = ['table.machine.create-button'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: table.*.create-button', () => {

        const permissions = ['table.*.create-button'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: feature.machine/*', () => {

        const permissions = ['feature.machine/*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(true);

      });
      it('permission: feature.machine/table.*', () => {

        const permissions = ['feature.machine/table.*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: feature.machine/table.machine.*', () => {

        const permissions = ['feature.machine/table.machine.*'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });
      it('permission: feature.machine/table.machine.create-button', () => {

        const permissions = ['feature.machine/table.machine.create-button'];

        expect(authorization.checkPermission(identifiers[0], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[0], permissions, scope)).toBe(true);
        expect(authorization.checkPermission(identifiers[1], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[1], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[2], permissions, scope)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions)).toBe(false);
        expect(authorization.checkPermission(identifiers[3], permissions, scope)).toBe(false);

      });

    });

    describe('setUserRoles', () => {

      let authorization: AuthorizationService;
      const roles = new ReplaySubject(1);

      beforeEach(() => {

        const method = { call: () => Promise.resolve({
            admin: [ '*' ],
            manager: [ 'feature.machine/*' ],
            default: [ 'feature.machine/table.*' ]
          }) } as any;
        authorization = new AuthorizationService(method);

      });

      it('set one role', async () => {

        const permissions = await authorization.setUserRoles(['admin']);

        expect(permissions).toEqual([ '*' ]);

      });

      it('set multiple role', async () => {

        const permissions = await authorization.setUserRoles(['admin', 'manager']);

        expect(permissions).toEqual([ '*', 'feature.machine/*' ]);

      });

    });

  });

});
