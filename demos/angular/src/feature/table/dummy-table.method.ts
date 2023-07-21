import { Method } from '@rxap/pattern';
import { TableEvent } from '@rxap/data-source/table';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';

@Injectable()
export class DummyTableMethod implements Method<any[], TableEvent> {

  data = this.getData(20);

  call(event: TableEvent): any[] {
    event.page ??= {
      pageIndex: 0,
      pageSize: 10,
    };
    if (event.setTotalLength) {
      event.setTotalLength(this.data.length);
    }
    return this.data.slice(
      event.page.pageIndex * event.page.pageSize,
      (event.page.pageIndex + 1) * event.page.pageSize,
    );
  }

  getData(size: number) {
    return Array.from({ length: size }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      age: faker.number.int({
        min: 18,
        max: 65,
      }),
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
