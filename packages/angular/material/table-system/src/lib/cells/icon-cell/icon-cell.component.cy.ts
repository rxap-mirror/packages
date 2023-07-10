import { TestBed } from '@angular/core/testing';
import { IconCellComponent } from './icon-cell.component';

describe(IconCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(IconCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(IconCellComponent);
  });
});
