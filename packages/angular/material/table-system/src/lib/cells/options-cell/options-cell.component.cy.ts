import { TestBed } from '@angular/core/testing';
import { OptionsCellComponent } from './options-cell.component';

describe(OptionsCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(OptionsCellComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(OptionsCellComponent, {
      componentProperties: {
        defaultViewValue: '', emptyViewValue: '',
      },
    });
  });
});
