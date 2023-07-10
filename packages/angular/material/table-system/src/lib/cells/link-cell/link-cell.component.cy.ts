import { TestBed } from '@angular/core/testing';
import { LinkCellComponent } from './link-cell.component';

describe(LinkCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(LinkCellComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(LinkCellComponent, {
      componentProperties: {
        short: true,
      },
    });
  });
});
