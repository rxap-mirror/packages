import { CommonModule } from '@angular/common';
import {
  Injectable,
  INJECTOR,
  Injector,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import '@angular/localize/init';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { faker } from '@faker-js/faker';
import {
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';
import { Range } from '@rxap/utilities';
import {
  select,
  text,
} from '@storybook/addon-knobs';
import {
  moduleMetadata,
  Story,
} from '@storybook/angular';
import {
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectToDisplay,
} from './decorators';
import { TableSelectControlModule } from './table-select-control.module';

interface Company {
  name: string;
  active: boolean;
  createdAt: Date;
}

@RxapStaticDataSource({
  id: 'company-list',
  data: Range.Create(0, 100).toArray().map(() => ({
    name: faker.name.lastName(),
    active: faker.datatype.boolean(),
    createdAt: faker.date.past(),
  })),
})
@Injectable()
class CompanyListDataSource extends StaticDataSource<Company[]> {
}

interface ITableSelectWithForm {
  company: string;
}

@RxapForm('with-form')
@Injectable()
class TableSelectWithForm implements FormType<ITableSelectWithForm> {

  rxapFormGroup!: RxapFormGroup<any, any>;

  @UseTableSelectColumns({
    name: { label: 'Name' },
    active: {
      label: 'Active',
      type: 'boolean',
    },
    createdAt: {
      label: 'Created at',
      format: 'yyyy-MM-dd',
      type: 'date',
    },
  })
  @UseTableSelectDataSource(CompanyListDataSource)
  @UseTableSelectToDisplay<Company>(item => item.name)
  @UseFormControl()
  company!: RxapFormControl;

}

function FormFactory(
  injector: Injector,
): TableSelectWithForm {
  return new RxapFormBuilder<ITableSelectWithForm>(TableSelectWithForm, injector).build();
}

export default {
  title: 'TableSelectControlComponent',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        MatInputModule,
        TableSelectControlModule,
        FormsModule,
        ReactiveFormsModule,
        RxapFormsModule,
      ],
      providers: [
        CompanyListDataSource,
        TableSelectWithForm,
        {
          provide: RXAP_FORM_DEFINITION,
          useFactory: FormFactory,
          deps: [ INJECTOR ],
        },
      ],
    }),
  ],
};

export const Primary: Story = () => ({
  props: {
    label: text('label', 'Select company'),
    appearance: select('appearance', {
      legacy: 'legacy',
      Standard: 'standard',
      fill: 'fill',
      outline: 'outline',
    }, 'standard'),
    columns: {
      name: { label: 'Name' },
      active: {
        label: 'Active',
        type: 'boolean',
      },
      createdAt: {
        label: 'Created at',
        format: 'yyyy-MM-dd',
        type: 'date',
      },
    },
    data: Range.Create(0, 100).toArray().map(() => ({
      name: faker.name.lastName(),
      active: faker.datatype.boolean(),
      createdAt: faker.date.past(),
    })),
    toDisplay: (value: any) => value.name,
  },
  template: `
    <mat-form-field
        [data]="data"
        [columns]="columns"
        [toDisplay]="toDisplay"
        eurogardTableSelectControl
        [appearance]="appearance">
      <mat-label i18n>{{label}}</mat-label>
      <eurogard-table-select-input placeholder="Select a company" ngModel></eurogard-table-select-input>
      <button
        eurogardOpenTableSelectWindow
        mat-icon-button
        matPrefix>
        <mat-icon>rule</mat-icon>
      </button>
    </mat-form-field>
  `,
});

export const WithForm: Story = () => ({
  template: `
  <form rxapForm>
    <mat-form-field eurogardTableSelectControl>
      <mat-label i18n>Select Company</mat-label>
      <eurogard-table-select-input eurogardOpenTableSelectWindow
        label="Select Location"
        i18n-label formControlName="company"></eurogard-table-select-input>
      <button
        eurogardOpenTableSelectWindow
        mat-icon-button
        matPrefix>
        <mat-icon>rule</mat-icon>
      </button>
    </mat-form-field>
  </form>
  `,
  moduleMetadata: {},
});
