import { TestBed } from '@angular/core/testing';
import { WindowToolBarComponent } from './window-tool-bar.component';

describe(WindowToolBarComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowToolBarComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowToolBarComponent);
  });
});
