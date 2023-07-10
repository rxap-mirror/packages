import { TestBed } from '@angular/core/testing';
import { LanguageSelectorComponent } from './language-selector.component';

describe(LanguageSelectorComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(LanguageSelectorComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(LanguageSelectorComponent);
  });
});
