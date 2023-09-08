import { Component } from '@angular/core';
import { TimeagoPipe } from './timeago.pipe';

describe(TimeagoPipe.name, () => {

  @Component({
    standalone: true,
    template: '<span>{{ date | timeago }}</span>',
    imports: [
      TimeagoPipe,
    ],
  })
  class TestComponent {

    date: number | string | Date = new Date();

  }

  it('renders', () => {
    cy.mount(TestComponent).then(response => {
      response.fixture.whenStable().then(() => {
        cy.get('span').should('have.text', 'less than a second ago');
      });
    });
  });

});
