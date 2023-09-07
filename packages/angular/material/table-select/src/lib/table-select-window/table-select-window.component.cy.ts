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
import {
  BehaviorSubject,
  Subject,
} from 'rxjs';
import { CreateFilterFormProvider } from '../create-filter-form-provider';
import { TableSelectWindowComponent } from './table-select-window.component';

describe(TableSelectWindowComponent.name, () => {

  let windowRef = {};
  let windowData: any = {};
  let rowList = [];
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
    windowData = {
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
    rowList = Array.from({ length: 100 }, () => ({
      name: faker.company.name(),
      location: faker.location.streetAddress(),
    }));
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
  });

  it('renders', () => {
    cy.mount(TableSelectWindowComponent);
    cy.get('table tbody tr').should('have.length', 10);
  });

  it('should show table loading animation', () => {
    const data = new Subject<any>();
    cy.mount(TableSelectWindowComponent, {
      providers: [
        {
          provide: TABLE_DATA_SOURCE,
          useValue: new TableDataSource(staticDataSource(data)),
        },
      ],
    }).then(response => {
      response.fixture.whenStable().then(() => {
        cy.get('mat-progress-bar').should('be.visible').then(() => {
          data.next([]);
          response.fixture.detectChanges();
          response.fixture.whenRenderingDone().then(() => {
            cy.get('mat-progress-bar', { timeout: 5000 }).should('not.exist');
          });
        });
      });
    });
  });

});
