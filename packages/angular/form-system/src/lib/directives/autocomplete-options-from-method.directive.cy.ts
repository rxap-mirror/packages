import { Component, Injectable, INJECTOR, Injector } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { InputClearButtonDirective } from '@rxap/material-form-system';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  OpenTableSelectWindowDirective,
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from '@rxap/ngx-material-table-select';
import { Method } from '@rxap/pattern';
import { ControlOption, ControlOptions } from '@rxap/utilities';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UseResolveMethod } from '../mixins/extract-resolve-method.mixin';
import {
  AutocompleteOptionsFromMethodDirective,
  UseAutocompleteOptionsMethod,
} from './autocomplete-options-from-method.directive';
import { RxapDataSource } from '@rxap/data-source';
import { DynamicTableDataSource } from '@rxap/data-source/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@rxap/icon';
import { MatInputModule } from '@angular/material/input';

describe(AutocompleteOptionsFormMethodDirective.name, () => {

  @Injectable()
  class TestAutocompleteOptionsMethod implements Method<ControlOptions> {
    call({search}: { search?: string | null }): ControlOptions {
      const list = !search ? [] : [ {
        value: '92765e0a-08fb-421c-b65e-0a08fbb21c58',
        display: 'display',
      } ].filter(option => option.display.toLowerCase().includes(search.toLowerCase()));
      return list;
    }
  }

  @Injectable()
  class TestResolveMethod implements Method<ControlOption, string> {

    call(value: string): ControlOption {
      return {value, display: 'resolved display'};
    }

  }

  interface TestTable {
    uuid: string;
    name: string;
  }

  @Injectable()
  class TestTableSelectMethod implements Method<TestTable[]> {
    call(): TestTable[] {
      return [
        {
          uuid: '92765e0a-08fb-421c-b65e-0a08fbb21c58',
          name: 'table A1',
        },
        {
          uuid: 'a050a0e3-746d-4df0-90a0-e3746d4df0d2',
          name: 'table A2',
        },
        {
          uuid: 'a8e99d75-95f2-4c66-a99d-7595f20c6657',
          name: 'table A3',
        },
      ];
    }

  }

  @RxapDataSource('test')
  @Injectable()
  class TestTableSelectDataSource extends DynamicTableDataSource<TestTable> {

    constructor(method: TestTableSelectMethod) {
      super(method);
    }

  }

  interface ITestFormDefinition {
    name: string;
  }

  @RxapForm('test')
  class TestFormDefinition implements FormType<ITestFormDefinition> {

    @UseTableSelectColumns({name: {label: 'Name', filter: true}})
    @UseTableSelectToDisplay<TestTable>(company => company.name)
    @UseTableSelectToValue<TestTable>(company => company.uuid)
    @UseTableSelectDataSource(TestTableSelectDataSource)

    @UseAutocompleteOptionsMethod(TestAutocompleteOptionsMethod)
    @UseResolveMethod(TestResolveMethod)
    @UseFormControl()
    name!: RxapFormControl;

  }

  @Component({
    standalone: true,
    imports: [
      ReactiveFormsModule,
      RxapFormsModule,
      MatAutocompleteModule,
      MatButtonModule,
      MatIconModule,
      AutocompleteOptionsFormMethodDirective,
      OpenTableSelectWindowDirective,
      IconModule,
      MatInputModule,
      InputClearButtonDirective,
    ],
    providers: [
      TestFormDefinition,
      TestResolveMethod,
      TestAutocompleteOptionsMethod,
      TestTableSelectDataSource,
      TestTableSelectMethod,
      {
        provide: RXAP_FORM_DEFINITION,
        useFactory: (injector: Injector) => new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition,
          injector).build(),
        deps: [ INJECTOR ],
      },
    ],
    template: `
      <form rxapForm>
        <mat-form-field>
          <mat-label>Name</mat-label>
          <button
            mat-icon-button
            matPrefix
            tabindex="-1"
            eurogardOpenTableSelectWindow
            label="select table"
          >
            <mat-icon svgIcon="table-eye"></mat-icon>
          </button>
          <input type="text"
                 placeholder="Pick one"
                 matInput
                 formControlName="name"
                 [matAutocomplete]="auto">
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *rxapAutocompleteOptionsFromMethod="let option; matAutocomplete: auto"
                        [value]="option.value">{{ option.display }}
            </mat-option>
          </mat-autocomplete>
          <button mat-icon-button rxapInputClearButton matSuffix>
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>
      </form>
    `,
  })
  class TestComponent {
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule ],
      providers: [ TestAutocompleteOptionsMethod ],
    }).compileComponents();
  });

  it('should create an instance', () => {
    cy.mount(TestComponent);
  });

  it('should be able to select an option with autocomplete', () => {
    cy.mount(TestComponent);
    cy.matFormFieldByLabel('Name').matInput().type('dis');
    cy.matOptionInOverlay('display', true).click();
    cy.matFormFieldByLabel('Name').matInput().should('have.value', 'display');
  });

  it('should ba able to select an option from the table select', () => {
    cy.mount(TestComponent);
    cy.matFormFieldByLabel('Name').matPrefixButton().click();
    cy.rxapWindow('select table').within(() => {
      cy.getTableRow('table A1', 'Name').click();
    });
    // instead of the value from the table select the resolved value should be displayed
    cy.matFormFieldByLabel('Name').matInput().should('have.value', 'resolved display');
  });

  it('should be able to clear the input', () => {
    cy.mount(TestComponent);
    cy.matFormFieldByLabel('Name').matInput().type('dis');
    cy.matOptionInOverlay('display', true).click();
    cy.matFormFieldByLabel('Name').matInput().should('have.value', 'display');
    cy.matFormFieldByLabel('Name').matSuffixButton().click();
    cy.matFormFieldByLabel('Name').matInput().should('have.value', '');
  });

});
