import { getGreeting } from '../support/app.po';

describe('form-system-chrome-extension', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to form-system-chrome-extension!');
  });
});
