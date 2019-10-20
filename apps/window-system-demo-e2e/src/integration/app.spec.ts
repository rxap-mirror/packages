import { getGreeting } from '../support/app.po';

describe('window-system-demo', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to window-system-demo!');
  });
});
