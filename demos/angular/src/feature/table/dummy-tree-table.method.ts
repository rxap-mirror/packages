import { Method } from '@rxap/pattern';
import { TableEvent } from '@rxap/data-source/table';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { Node } from '@rxap/data-structure-tree';
import { DummyTableMethod } from './dummy-table.method';

@Injectable()
export class DummyTreeTableMethod implements Method<any[], TableEvent> {

  data = this.getData(5);

  call(parent?: Node<any>): any[] {
    console.log('call', parent);
    let data: any[] = this.data;
    if (parent) {
      const size = 5 - parent.depth;
      data = this.getData(size)
                 .map(item => ({
                   ...item,
                   hasChildren: size === 0 ? false : item.hasChildren,
                 }));
    }
    return data.map(item => ({
      ...item,
      name: `${ (parent?.depth ?? -1) + 1 } - ${ item.name }`,
    }));
  }

  getData(size: number) {
    return Array.from({ length: size }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      age: faker.number.int({
        min: 18,
        max: 65,
      }),
      hasChildren: faker.datatype.boolean(),
      isActive: faker.datatype.boolean(),
      email: faker.internet.email(),
      rating: parseFloat(faker.finance.amount(0, 5, 1)),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode(),
      },
      phoneNumber: faker.phone.number(),
      isAdmin: faker.datatype.boolean(),
      balance: parseFloat(faker.finance.amount(100, 10000, 2)),
      numberOfOrders: faker.number.int({
        min: 1,
        max: 100,
      }),
      isVerified: faker.datatype.boolean(),
      birthDate: faker.date.past({
        years: 65,
        refDate: '2002-01-01',
      }),
      registrationDate: faker.date.past({ years: 3 }),
      lastLogin: faker.date.recent(),
      profilePicture: faker.image.avatar(),
      accountStatus: faker.datatype.boolean() ? 'Active' : 'Inactive',
      loyaltyPoints: faker.number.int({
        min: 0,
        max: 1000,
      }),
      nickname: faker.internet.userName(),
      favoriteColor: faker.color.human(),
      occupation: faker.person.jobTitle(),
    }));
  }

}
