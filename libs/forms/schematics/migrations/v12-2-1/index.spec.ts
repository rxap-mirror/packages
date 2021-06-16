import { CreateEmptyInterface, AddMissingType, UpdateType } from './index';

describe('@rxap/forms', () => {
  describe('Migration', () => {
    describe('v12-2-0', () => {
      it('should add interface after all imports', () => {
        const content = `import { Test } from 'test';
import { Test2 } from 'test2';
import { Test3 } from 'test3';

export const test44 = 'test';

export class User {}
`;

        expect(CreateEmptyInterface(content, 'Car'))
          .toEqual(`import { Test } from 'test';
import { Test2 } from 'test2';
import { Test3 } from 'test3';

export interface ICar {
}

export const test44 = 'test';

export class User {}
`);
      });

      it('should add missing type to RxapFormBuilder Constructor', () => {
        const content = `
        interface IUserForm {}

        new RxapFormBuilder(UserForm);
        `;

        expect(AddMissingType(content)).toEqual(`
        interface IUserForm {}

        new RxapFormBuilder<IUserForm>(UserForm);
        `);
      });

      it('should add missing type for multiple RxapFormBuilder Constructors', () => {
        const content = `
        interface IUserForm {}
        interface ICarForm {}

        new RxapFormBuilder(UserForm);
        new RxapFormBuilder(CarForm);
        `;

        expect(AddMissingType(content)).toEqual(`
        interface IUserForm {}
        interface ICarForm {}

        new RxapFormBuilder<IUserForm>(UserForm);
        new RxapFormBuilder<ICarForm>(CarForm);
        `);
      });

      it('should add interface if not defined while adding missing type for RxapFormBuilder Constructor', () => {
        const content = `new RxapFormBuilder(UserForm);`;

        expect(AddMissingType(content)).toEqual(`export interface IUserForm {
}

new RxapFormBuilder<IUserForm>(UserForm);`);
      });

      it('should update type for RxapFormBuilder', () => {
        const content = `
        interface IUserForm {}

        RxapFormBuilder<UserForm>
        `;

        expect(UpdateType(content)).toEqual(`
        interface IUserForm {}

        RxapFormBuilder<IUserForm>
        `);
      });
      it('should update type for multiple RxapFormBuilder Constructors', () => {
        const content = `
        interface IUserForm {}
        interface ICarForm {}

        RxapFormBuilder<UserForm>
        RxapFormBuilder<CarForm>
        `;

        expect(UpdateType(content)).toEqual(`
        interface IUserForm {}
        interface ICarForm {}

        RxapFormBuilder<IUserForm>
        RxapFormBuilder<ICarForm>
        `);
      });

      it('should add interface if not defined while update type for RxapFormBuilder Constructor', () => {
        const content = `RxapFormBuilder<UserForm>`;

        expect(UpdateType(content)).toEqual(`export interface IUserForm {
}

RxapFormBuilder<IUserForm>`);
      });
    });
  });
});
