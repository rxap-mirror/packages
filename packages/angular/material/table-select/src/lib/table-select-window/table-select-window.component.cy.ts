import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { faker } from '@faker-js/faker';
import { staticDataSource } from '@rxap/data-source';
import { TableDataSource } from '@rxap/data-source/table';
import {
  SelectionModel,
  SelectRowService,
  TABLE_DATA_SOURCE,
} from '@rxap/material-table-system';
import {
  RXAP_WINDOW_DATA,
  RXAP_WINDOW_REF,
} from '@rxap/window-system';
import { BehaviorSubject } from 'rxjs';
import { CreateFilterFormProvider } from '../create-filter-form-provider';
import { TableSelectWindowComponent } from './table-select-window.component';

describe(TableSelectWindowComponent.name, () => {

  let windowRef = {};
  const selectRowService = {
    selectedRows$: new BehaviorSubject([]),
    selectionModel: new SelectionModel(),
    get selectedRows() {
      return this.selectedRows$.value;
    },
  };

  beforeEach(() => {
    cy.viewport(800, 800);
    windowRef = {
      complete: cy.spy(),
      next: cy.spy(),
      setFooterPortal: cy.spy(),
    };
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: RXAP_WINDOW_REF,
          useValue: windowRef,
        },
        {
          provide: SelectRowService,
          useValue: selectRowService,
        },
      ],
    });
  });

  it('renders', () => {
    const windowData = {
      id: 'test',
      columns: new Map([
        [ 'name',
          {
            label: 'Name',
            filter: true,
          },
        ],
        [ 'location',
          {
            label: 'Location',
            filter: true,
          },
        ],
      ]),
      title: 'test',
    };
    const rowList = Array.from({ length: 100 }, () => ({
      name: faker.company.name(),
      location: faker.location.streetAddress(),
    }));
    cy.mount(TableSelectWindowComponent, {
      providers: [
        {
          provide: RXAP_WINDOW_DATA,
          useValue: windowData,
        },
        {
          provide: TABLE_DATA_SOURCE,
          useValue: new TableDataSource(staticDataSource(rowList)),
        },
        CreateFilterFormProvider(windowData.columns),
      ],
    });
    cy.get('table tbody tr').should('have.length', 10);
  });

});
