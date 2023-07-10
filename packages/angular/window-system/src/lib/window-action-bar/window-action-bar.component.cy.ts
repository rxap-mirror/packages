import { TestBed } from '@angular/core/testing';
import { WindowActionBarComponent } from './window-action-bar.component';

describe(WindowActionBarComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowActionBarComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowActionBarComponent);
  });
});
