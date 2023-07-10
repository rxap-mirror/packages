import { TestBed } from '@angular/core/testing';
import { WindowTaskComponent } from './window-task.component';

describe(WindowTaskComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowTaskComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowTaskComponent);
  });
});
