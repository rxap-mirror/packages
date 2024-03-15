import { AuthenticationContainerComponent } from './authentication-container.component';

describe(AuthenticationContainerComponent.name, () => {

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('renders', () => {
    cy.mount(AuthenticationContainerComponent);
  });
});
