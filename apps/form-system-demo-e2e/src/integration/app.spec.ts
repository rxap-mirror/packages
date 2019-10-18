import { getGreeting } from '../support/app.po';

describe('form-system-demo', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to form-system-demo!');
  });
});
