/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Chainable<Subject> {

    /**
     * Get a <mat-form-field>  by the formControlName
     * @param formControlName
     */
    matFormField(formControlName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * --
     */
    matFormFieldByLabel(label: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <mat-error> elements visible in the <mat-form-field>
     */
    matError(): Chainable<JQuery<HTMLElement>>;

    /**
     * Type into a <mat-form-field>
     *
     * 1. click on the label
     * 2. type the value into the input
     *
     * this is a workaround for the issue that the input is not visible -> this would result in an error
     *
     * @param value
     * @deprecated use matInput().type() instead
     */
    matType(value: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <input> element of a <mat-form-field>
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matInput()
     */
    matInput(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <mat-select> element of a <mat-form-field>
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *  .matSelect()
     */
    matSelect(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <mat-tab> element by the tab name
     *
     * @example
     * cy.matTab(...)
     */
    matTab(tabName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the active <mat-tab-body> element
     *
     * @example
     * cy.matTabBody()
     */
    matTabBody(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <mat-expansion-panel-header> element by the panel name
     *
     * @example
     * cy.matExpansionPanelHeader(...)
     */
    matExpansionPanelHeader(panelName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the expansion panel content element by the panel name
     *
     * @example
     * cy.matExpansionPanelContent(...)
     */
    matExpansionPanelContent(panelName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the expansion panel body element by the panel name
     *
     * @example
     * cy.matExpansionPanelBody(...)
     */
    matExpansionPanelBody(panelName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the expansion panel element by the panel name
     *
     * @example
     * cy.matExpansionPanel(...)
     */
    matExpansionPanel(panelName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the form control field prefix button
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matPrefixButton()
     */
    matPrefixButton(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the form control field suffix button
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matSuffixButton()
     */
    matSuffixButton(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the form control field prefix element
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matPrefix()
     */
    matPrefix(): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the form control field suffix element
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matSuffix()
     */
    matSuffix(): Chainable<JQuery<HTMLElement>>;

    /**
     * Open the mat-select overlay
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matSelect()
     *   .openMatSelect();
     * cy.matOptionInOverlay(...).click();
     */
    openMatSelect(): Chainable<void>;

    /**
     * Get the <mat-option> element by the display text
     *
     * @example
     * cy.matFormFieldByLabel(...)
     *   .matSelect()
     *   .openMatSelect();
     * cy.matOptionInOverlay(...).click();
     *
     * @example
     * cy.rxapWindow(...).within(() => {
     *  cy.matFormFieldByLabel(...)
     *    .matSelect()
     *    .openMatSelect();
     * });
     * cy.matOptionInOverlay(...).click();
     *
     * @param displayText The display text of the <mat-option> element
     */
    matOptionInOverlay(displayText: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the rxap-window-container by the window title
     *
     * @example
     * cy.rxapWindow(...).within(() => {
     *   // do something
     * });
     *
     * @param title The title of the window
     */
    rxapWindow(title: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the confirm tooltip
     *
     * @example
     * cy.rxapConfirmDialog().within(() => {
     *   // do something
     * });
     *
     */
    rxapConfirmDialog(): Chainable<JQuery<HTMLElement>>;

    /**
     * Click on a table row icon button by the icon name, the value and the column name
     *
     * TODO : rename to rxapTableAction
     * TODO : remove the click call and only return the button element
     *
     * @param iconName
     * @param value
     * @param columnTitle
     */
    tableRowIconButton(
      iconName: string,
      value: string,
      columnTitle: string,
    ): Chainable<void>;

    /**
     * Click on a table row icon button by the icon name, the value and the column name
     *
     * TODO : merge with tableRowIconButton
     *
     * @param svgIconName
     * @param value
     * @param columnTitle
     */
    tableRowSvgIconButton(
      svgIconName: string,
      value: string,
      columnTitle: string,
    ): Chainable<void>;

    /**
     * Get the column name of a table by the column title
     *
     * @param columnTitle
     */
    getTableColumnName(columnTitle: string): Chainable<string>;

    /**
     * Get a table row by the value and the column title
     *
     * @param value
     * @param columnTitle
     */
    getTableRow(value: string, columnTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get a table column by the column title
     *
     * @param columnTitle
     */
    getTableColumn(columnTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Open the table options
     */
    openTableOptions(): Chainable<void>;

    /**
     * Toggle the table column by the column title
     * @param columnTitle
     */
    toggleTableColumn(columnTitle: string): Chainable<void>;

    /**
     * Close the cdk overlay by clicking on the backdrop
     */
    closeCdkOverlay(): Chainable<void>;

    /**
     * Get the create button of the table
     */
    getTableCreateButton(): Chainable<JQuery<HTMLElement>>;

    smoccSelectableOptions(formControlName: string, index: number): Chainable<JQuery<HTMLElement>>;
  }
}

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => {
//   console.log('Custom command example: Login', email, password);
// });
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/**
 *
 * <mat-form-field>
 * <mat-label>Input Label Text</mat-lable>
 * <input matInput formControlName="username">
 * </mat-form-field>
 *
 */

Cypress.Commands.add('matFormField', (formControlName: string) => {
  return cy.get(`mat-form-field input[formcontrolname="${ formControlName }"]`).parents('mat-form-field').first();
});

Cypress.Commands.add('matFormFieldByLabel', (label: string) => {
  return cy.get(`mat-form-field mat-label`).contains(label).parents('mat-form-field').first();
});

Cypress.Commands.add('matError', {prevSubject: true}, (subject) => {
  return cy.wrap(subject).find('mat-error').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matType', {prevSubject: true}, (subject, value: string) => {
  cy.wrap(subject).click();
  cy.wrap(subject).matInput().type(value);
  return undefined;
});

Cypress.Commands.add('matInput', {prevSubject: true}, (subject) => {
  cy.wrap(subject).click();
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('input').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matPrefixButton', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('button[matprefix]').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matSuffixButton', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('button[matsuffix]').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matPrefix', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('[matprefix]').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matSuffix', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('[matsuffix]').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});

Cypress.Commands.add('matSelect', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('mat-select').then(($matSelect: JQuery<HTMLElement>) => {
    return cy.wrap($matSelect);
  });
});

Cypress.Commands.add('matTab', (tabName: string) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.contains('.mat-mdc-tab', tabName).then(($tab: JQuery<HTMLElement>) => {
    return cy.wrap($tab);
  });
});

Cypress.Commands.add('matTabBody', () => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.get('mat-tab-body[aria-hidden="false"]').then(($tabBody: JQuery<HTMLElement>) => {
    return cy.wrap($tabBody);
  });
});

Cypress.Commands.add('matExpansionPanelHeader', (panelName: string) => {
  return cy.contains('.mat-expansion-panel-header', panelName).then(($panel: JQuery<HTMLElement>) => {
    return cy.wrap($panel);
  });
});

Cypress.Commands.add('matExpansionPanel', (panelName: string) => {
  return cy.matExpansionPanelHeader(panelName).parents('mat-expansion-panel').then(($panelContent: JQuery<HTMLElement>) => {
    return cy.wrap($panelContent);
  });
});

Cypress.Commands.add('matExpansionPanelContent', (panelName: string) => {
  return cy.matExpansionPanel(panelName).find('.mat-expansion-panel-content').then(($panelContent: JQuery<HTMLElement>) => {
    return cy.wrap($panelContent);
  });
});

Cypress.Commands.add('matExpansionPanelBody', (panelName: string) => {
  return cy.matExpansionPanel(panelName).find('.mat-expansion-panel-body').then(($panelContent: JQuery<HTMLElement>) => {
    return cy.wrap($panelContent);
  });
});

Cypress.Commands.add('openMatSelect', {prevSubject: true}, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  cy.wrap(subject).find('.mat-mdc-select-trigger').then(($matSelect: JQuery<HTMLElement>) => {
    cy.wrap($matSelect).click();
  });
});

Cypress.Commands.add('matOptionInOverlay', (displayText: string) => {
  return cy.get(`.cdk-overlay-pane .mat-mdc-select-panel mat-option`).contains(displayText);
});

Cypress.Commands.add('rxapWindow', (windowTitle: string) => {
  return cy.get(`rxap-window-container rxap-window-tool-bar`)
  .contains(windowTitle)
  .parents('rxap-window-container')
  .first();
});

Cypress.Commands.add('rxapConfirmDialog', () => {
  return cy.get(`.cdk-overlay-container rxap-confirm`);
});

Cypress.Commands.add(
  'tableRowIconButton',
  (iconName, value, columnTitle) => {
    cy.getTableRow(value, columnTitle).within(() => cy.contains('button mat-icon', iconName).parents('button').click());
  },
);

Cypress.Commands.add(
  'tableRowSvgIconButton',
  (iconName, value, columnName) => {
    cy.getTableRow(value, columnName).within(() => cy.get(`button mat-icon[svgIcon="${ iconName }"]`).parents('button').click());
  },
);

Cypress.Commands.add('getTableColumnName', (columnTitle: string) => {
  return cy.contains('thead tr:last-child th.mat-mdc-header-cell', columnTitle).then(th => {
    // Get class attribute
    const classAttribute = th.attr('class');

    if (!classAttribute) {
      throw new Error('Could not find class attribute on table column name element');
    }

    // Match cdk-column value from the class attribute using a regular expression
    const match = classAttribute.match(/cdk-column-(\w+)/);
    if (match && match[1]) {
      // Extracted column name from cdk-column
      return match[1];
    }
    else {
      throw new Error(`Could not extract column name from class attribute: ${ classAttribute }`);
    }
  });
});

Cypress.Commands.add('getTableColumn', (columnTitle: string) => {
  return cy.getTableColumnName(columnTitle).then(columnName => {
    return cy.get(`td.cdk-column-${ columnName }`).then(($element: JQuery<HTMLElement>) => {
      return cy.wrap($element);
    });
  });
});

Cypress.Commands.add('getTableRow', (value: string, columnTitle: string) => {
  return cy.getTableColumnName(columnTitle).then(columnName => {
    return cy.contains(`td.cdk-column-${ columnName }`, value).parents('tr').then(($element: JQuery<HTMLElement>) => {
      return cy.wrap($element);
    });
  });
});

Cypress.Commands.add(
  'openTableOptions',
  () => {
    cy.get('button mat-icon').contains('tune').parents('button').click();
  },
);

Cypress.Commands.add(
  'toggleTableColumn',
  (columnTitle: string) => {
    cy.contains('.mat-mdc-menu-item', columnTitle).click();
  }
);

Cypress.Commands.add(
  'closeCdkOverlay',
  () => {
    cy.get('.cdk-overlay-backdrop').click()
  },
);

Cypress.Commands.add(
  'getTableCreateButton',
  () => cy.get('.mat-mdc-card .mat-mdc-mini-fab .mat-icon').contains('add').parents('button').then(($element: JQuery<HTMLElement>) => {
    return cy.wrap($element);
  }),
);

Cypress.Commands.add('smoccSelectableOptions', (formControlName: string, index: number) => {
  return cy.get(`eurogard-select-multiple-or-create-control[formcontrolname="${ formControlName }"] .mat-mdc-action-list:nth-of-type(${ index })`);
});

