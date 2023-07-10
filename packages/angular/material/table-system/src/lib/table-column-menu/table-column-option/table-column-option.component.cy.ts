import { TestBed } from '@angular/core/testing';
import { TableColumnOptionComponent } from './table-column-option.component';

describe(TableColumnOptionComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(TableColumnOptionComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TableColumnOptionComponent, {
      componentProperties: {
        name: '', active: true, inactive: '', hidden: '', show: '',
      },
    });
  });
});
