import { TestBed } from '@angular/core/testing';
import { DataGridComponent } from './data-grid.component';
import {
  Component,
  Injector,
  INJECTOR,
} from '@angular/core';
import { DataGridModule } from './data-grid.module';
import { MatInputModule } from '@angular/material/input';
import {
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ControlErrorDirective } from '@rxap/material-form-system';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonPipe } from '@angular/common';
import {
  BaseDataSource,
  staticDataSource,
} from '@rxap/data-source';
import { BehaviorSubject } from 'rxjs';

describe(DataGridComponent.name, () => {

  interface ITestForm {
    username: string;
    email: string;
    age: number;
  }

  @RxapForm('test-form')
  class TestForm implements FormType<ITestForm> {

    @UseFormControl({
      validators: [
        Validators.required,
        Validators.minLength(3),
      ],
    })
    username!: RxapFormControl<string>;

    @UseFormControl({
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(30),
      ],
    })
    email!: RxapFormControl<string>;

    @UseFormControl({
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
      ],
    })
    age!: RxapFormControl<number>;

  }

  function FormFactory(
    injector: Injector,
  ): TestForm {
    return new RxapFormBuilder<ITestForm>(TestForm, injector).build({});
  }

  const data: ITestForm = {
    username: 'test',
    email: 'test@example.de',
    age: 10,
  };

  let dataSource: BaseDataSource<ITestForm>;
  let data$: BehaviorSubject<ITestForm>;

  const FormProviders = [
    {
      provide: RXAP_FORM_DEFINITION,
      useFactory: FormFactory,
      deps: [ INJECTOR ],
    },
  ];

  beforeEach(() => {
    data$ = new BehaviorSubject<ITestForm>(data);
    dataSource = staticDataSource(data$);
    TestBed.overrideComponent(DataGridComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(DataGridComponent, {
      componentProperties: {
        header: true,
        mode: 'plain',
      },
    });
  });

  it('should render each row with data in plain mode without custom header, cell or edit-cell', () => {

    @Component({
      standalone: true,
      template: `
        <rxap-data-grid [data]="data" [mode]="'plain'">
          <ng-container rxapDataGridRowDef="username"></ng-container>
          <ng-container rxapDataGridRowDef="email"></ng-container>
          <ng-container rxapDataGridRowDef="age"></ng-container>
        </rxap-data-grid>`,
      imports: [ DataGridModule ],
    })
    class TestComponent {

      data = data;

    }

    cy.mount(TestComponent);
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('[data-name="username"] > th').should('have.text', 'username');
    cy.get('[data-name="username"] > .value > div').should('have.text', 'test');
    cy.get('[data-name="email"] > th').should('have.text', 'email');
    cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de');
    cy.get('[data-name="age"] > th').should('have.text', 'age');
    cy.get('[data-name="age"] > .value > div').should('have.text', '10');

  });

  it('should render each row with data in plain mode with custom header and cell', () => {

    @Component({
      standalone: true,
      template: `
        <rxap-data-grid [data]="data" [mode]="'plain'">
          <ng-container rxapDataGridRowDef="username">
            <th *rxapDataGridHeaderCellDef>Benutzer Name</th>
            <ng-template rxapDataGridCellDef let-value>{{ value }}#5242</ng-template>
          </ng-container>
          <ng-container rxapDataGridRowDef="email">
            <th *rxapDataGridHeaderCellDef>E-Mail</th>
            <ng-template rxapDataGridCellDef let-value>{{ value }}#588</ng-template>
          </ng-container>
          <ng-container rxapDataGridRowDef="age">
            <th *rxapDataGridHeaderCellDef>Target Age</th>
            <ng-template rxapDataGridCellDef let-value>{{ value * 10 }}</ng-template>
          </ng-container>
        </rxap-data-grid>`,
      imports: [ DataGridModule ],
    })
    class TestComponent {

      data = data;

    }

    cy.mount(TestComponent);
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('[data-name="username"] > th').should('have.text', 'Benutzer Name');
    cy.get('[data-name="username"] > .value > div').should('have.text', 'test#5242');
    cy.get('[data-name="email"] > th').should('have.text', 'E-Mail');
    cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de#588');
    cy.get('[data-name="age"] > th').should('have.text', 'Target Age');
    cy.get('[data-name="age"] > .value > div').should('have.text', '100');

  });

  it('should render each row with data in plain mode with custom header and cell and custom edit-cell', () => {

    @Component({
      standalone: true,
      template: `
        <form rxapForm>
          <rxap-data-grid [data]="data" [mode]="'plain'">
            <ng-container rxapDataGridRowDef="username">
              <th *rxapDataGridHeaderCellDef>Username</th>
              <ng-template rxapDataGridCellDef let-value>{{ value }}#5242</ng-template>
              <ng-template rxapDataGridEditCellDef let-value>
                <mat-form-field>
                  <input matInput formControlName="username" type="text"/>
                  <mat-error *rxapControlError="let error key 'required'">
                    Username is required
                  </mat-error>
                  <mat-error *rxapControlError="let error key 'minLength'">
                    Username must have at least the length {{ error.requiredLength }}
                  </mat-error>
                </mat-form-field>
              </ng-template>
            </ng-container>
            <ng-container rxapDataGridRowDef="email">
              <th *rxapDataGridHeaderCellDef>E-Mail</th>
              <ng-template rxapDataGridCellDef let-value>{{ value }}</ng-template>
              <ng-template rxapDataGridEditCellDef let-value>
                <mat-form-field>
                  <input matInput formControlName="email" type="email"/>
                  <mat-error *rxapControlError="let error key 'required'">
                    E-Mail is required
                  </mat-error>
                  <mat-error *rxapControlError="let error key 'email'">
                    Input must be a valid email
                  </mat-error>
                  <mat-error *rxapControlError="let error key 'maxLength'">
                    E-Mail can not be longer then {{ error.requiredLength }} characters
                  </mat-error>
                </mat-form-field>
              </ng-template>
            </ng-container>
            <ng-container rxapDataGridRowDef="age">
              <th *rxapDataGridHeaderCellDef>Age</th>
              <ng-template rxapDataGridCellDef let-value>{{ value * 10 }}</ng-template>
              <ng-template rxapDataGridEditCellDef let-value>
                <mat-form-field>
                  <input matInput formControlName="age" type="number"/>
                  <mat-error *rxapControlError="let error key 'required'">
                    Age is required
                  </mat-error>
                  <mat-error *rxapControlError="let error key 'min'">
                    The minimum age is {{ error.min }}
                  </mat-error>
                  <mat-error *rxapControlError="let error key 'max'">
                    The maximum age is {{ error.max }}
                  </mat-error>
                </mat-form-field>
              </ng-template>
            </ng-container>
          </rxap-data-grid>
        </form>`,
      imports: [
        JsonPipe,
        DataGridModule,
        MatInputModule,
        ReactiveFormsModule,
        ControlErrorDirective,
        RxapFormsModule,
      ],
      providers: [
        FormProviders,
      ],
    })
    class TestComponent {

      data = data;

    }

    cy.viewport(700, 500);
    cy.mount(TestComponent, {
      imports: [ NoopAnimationsModule ],
    });
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('[data-name="username"] > th').should('have.text', 'Username');
    cy.get('[data-name="username"] > .value > div').should('have.text', 'test#5242');
    cy.get('[data-name="email"] > th').should('have.text', 'E-Mail');
    cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de');
    cy.get('[data-name="age"] > th').should('have.text', 'Age');
    cy.get('[data-name="age"] > .value > div').should('have.text', '100');
    cy.contains('button', 'Edit').click();
    cy.get('button').contains('Save').should('exist');
    cy.get('button').contains('Reset').should('exist');
    cy.get('button').contains('Cancel').should('exist');

    cy.matFormField('username').matInput().should('have.value', 'test');
    cy.matFormField('email').matInput().should('have.value', 'test@example.de');
    cy.matFormField('age').matInput().should('have.value', '10');

    cy.matFormField('username').matInput().clear();
    cy.matFormField('email').matInput().clear();
    cy.matFormField('age').matInput().clear();

    // region test if the reset button is working
    cy.matFormField('username').matInput().should('have.value', '');
    cy.matFormField('email').matInput().should('have.value', '');
    cy.matFormField('age').matInput().should('have.value', '');
    cy.contains('button', 'Reset').click();
    cy.matFormField('username').matInput().should('have.value', 'test');
    cy.matFormField('email').matInput().should('have.value', 'test@example.de');
    cy.matFormField('age').matInput().should('have.value', '10');
    // endregion

    // region test if validators are working after a submit with invalid inputs
    cy.matFormField('username').matInput().clear();
    cy.matFormField('email').matInput().clear();
    cy.matFormField('age').matInput().clear();
    cy.contains('button', 'Save').click();
    cy.matFormField('username').matError().should('contain.text', 'Username is required');
    cy.matFormField('email').matError().should('contain.text', 'E-Mail is required');
    cy.matFormField('age').matError().should('contain.text', 'Age is required');
    cy.get('mat-error').contains('Ensure all formula fields are valid').should('exist');
    // endregion

    // region test if errors are shown if input is invalid
    cy.matFormField('username').matInput().type('t');
    cy.matFormField('email').matInput().type('t');
    cy.matFormField('age').matInput().type('0');
    cy.matFormField('username').matError().should('contain.text', 'Username must have at least the length 3');
    cy.matFormField('email').matError().should('contain.text', 'Input must be a valid email');
    cy.matFormField('age').matError().should('contain.text', 'The minimum age is 1');
    cy.matFormField('age').matInput().clear().type('1000');
    cy.matFormField('age').matError().should('contain.text', 'The maximum age is 100');
    // endregion

    // region test if submit is not possible
    cy.contains('button', 'Save').click();
    cy.get('button').contains('Save').should('exist');
    cy.get('button').contains('Reset').should('exist');
    cy.get('button').contains('Cancel').should('exist');
    // endregion

    // region test if errors are not shown if input is valid
    cy.matFormField('age').matInput().clear().type('50');
    cy.matFormField('age').matError().should('not.exist');
    cy.matFormField('email').matInput().clear().type('mail@domain.com');
    cy.matFormField('email').matError().should('not.exist');
    cy.matFormField('username').matInput().type('SabeVon');
    cy.matFormField('username').matError().should('not.exist');
    // endregion

    // region test if submit works with valid inputs
    cy.contains('button', 'Save').click();
    cy.get('button').contains('Save').should('not.exist');
    cy.get('button').contains('Reset').should('not.exist');
    cy.get('button').contains('Cancel').should('not.exist');
    cy.get('button').contains('Edit').should('exist');
    // endregion

    // region test if the cancel button is working
    cy.contains('button', 'Edit').click();
    cy.matFormField('age').matInput().clear().type('50');
    cy.matFormField('email').matInput().clear().type('mail@domain.com');
    cy.matFormField('username').matInput().type('SabeVon');
    cy.contains('button', 'Cancel').click();
    cy.get('button').contains('Save').should('not.exist');
    cy.get('button').contains('Reset').should('not.exist');
    cy.get('button').contains('Cancel').should('not.exist');
    cy.get('button').contains('Edit').should('exist');
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('[data-name="username"] > th').should('have.text', 'Username');
    cy.get('[data-name="username"] > .value > div').should('have.text', 'test#5242');
    cy.get('[data-name="email"] > th').should('have.text', 'E-Mail');
    cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de');
    cy.get('[data-name="age"] > th').should('have.text', 'Age');
    cy.get('[data-name="age"] > .value > div').should('have.text', '100');
    // endregion

  });

  it('should connected to data source', () => {

    @Component({
      standalone: true,
      template: `
        <rxap-data-grid [dataSource]="dataSource" [mode]="'plain'">
          <ng-container rxapDataGridRowDef="username"></ng-container>
          <ng-container rxapDataGridRowDef="email"></ng-container>
          <ng-container rxapDataGridRowDef="age"></ng-container>
        </rxap-data-grid>`,
      imports: [ DataGridModule ],
    })
    class TestComponent {

      dataSource = dataSource;

    }

    cy.mount(TestComponent);
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('[data-name="username"] > th').should('have.text', 'username');
    cy.get('[data-name="username"] > .value > div').should('have.text', 'test');
    cy.get('[data-name="email"] > th').should('have.text', 'email');
    cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de');
    cy.get('[data-name="age"] > th').should('have.text', 'age');
    cy.get('[data-name="age"] > .value > div').should('have.text', '10');

  });

  it('should refresh data if data source changes', () => {

    @Component({
      standalone: true,
      template: `
        <rxap-data-grid [dataSource]="dataSource" [mode]="'plain'">
          <ng-container rxapDataGridRowDef="username"></ng-container>
          <ng-container rxapDataGridRowDef="email"></ng-container>
          <ng-container rxapDataGridRowDef="age"></ng-container>
        </rxap-data-grid>`,
      imports: [ DataGridModule ],
    })
    class TestComponent {

      dataSource = dataSource;

    }

    cy.mount(TestComponent).then(ref => {

      cy.get('table tbody tr').should('have.length', 3);
      cy.get('[data-name="username"] > th').should('have.text', 'username');
      cy.get('[data-name="username"] > .value > div').should('have.text', 'test');
      cy.get('[data-name="email"] > th').should('have.text', 'email');
      cy.get('[data-name="email"] > .value > div').should('have.text', 'test@example.de');
      cy.get('[data-name="age"] > th').should('have.text', 'age');
      cy.get('[data-name="age"] > .value > div').should('have.text', '10').then(() => {

        data$.next({
          username: 'test2',
          email: 'mail@domain.de',
          age: 45,
        });

        cy.wait(100).then(() => {
          ref.fixture.detectChanges();

          cy.get('table tbody tr').should('have.length', 3);
          cy.get('[data-name="username"] > th').should('have.text', 'username');
          cy.get('[data-name="username"] > .value > div').should('have.text', 'test2');
          cy.get('[data-name="email"] > th').should('have.text', 'email');
          cy.get('[data-name="email"] > .value > div').should('have.text', 'mail@domain.de');
          cy.get('[data-name="age"] > th').should('have.text', 'age');
          cy.get('[data-name="age"] > .value > div').should('have.text', '45');

        });

      });
    });

  });

  it('should show error if data source has error', () => {

    @Component({
      standalone: true,
      template: `
        <rxap-data-grid [dataSource]="dataSource" [mode]="'plain'">
          <ng-container rxapDataGridRowDef="username"></ng-container>
          <ng-container rxapDataGridRowDef="email"></ng-container>
          <ng-container rxapDataGridRowDef="age"></ng-container>
        </rxap-data-grid>`,
      imports: [ DataGridModule ],
    })
    class TestComponent {

      dataSource = dataSource;

    }

    cy.mount(TestComponent).then(async response => {
      await response.fixture.whenStable();

      dataSource.hasError$.enable();
      cy.wait(100).then(() => {
        response.fixture.detectChanges();
        cy.get('span').should('contain.text', 'Something has gone wrong!');
        cy.get('button').contains('Retry').should('exist');
        cy.wrap(true).then(() => {
          dataSource.hasError$.disable();
        });
        cy.contains('button', 'Retry').click();
        cy.get('span').should('not.contain.text', 'Something has gone wrong!');
        cy.contains('button', 'Retry').should('not.exist');
      });

    });

  });

});
