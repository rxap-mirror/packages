import { TestBed } from '@angular/core/testing';
import { WindowTaskBarComponent } from './window-task-bar.component';

describe(WindowTaskBarComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowTaskBarComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowTaskBarComponent);
  });
});
