import { TestBed } from '@angular/core/testing';
import { TableShowArchivedSlideComponent } from './table-show-archived-slide.component';

describe(TableShowArchivedSlideComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(TableShowArchivedSlideComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TableShowArchivedSlideComponent);
  });
});
