import { TestBed } from '@angular/core/testing';
import { TableSelectControlsComponent } from './table-select-controls.component';

describe(TableSelectControlsComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(TableSelectControlsComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TableSelectControlsComponent);
  });
});
