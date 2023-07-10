import { TestBed } from '@angular/core/testing';
import { PromptUpdateComponent } from './prompt-update.component';

describe(PromptUpdateComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(PromptUpdateComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(PromptUpdateComponent);
  });
});
