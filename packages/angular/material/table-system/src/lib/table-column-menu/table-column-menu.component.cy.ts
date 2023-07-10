import { TestBed } from '@angular/core/testing';
import { TableColumnMenuComponent } from './table-column-menu.component';

describe(TableColumnMenuComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(TableColumnMenuComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TableColumnMenuComponent, {
      componentProperties: {
        matCard: '',
      },
    });
  });
});
