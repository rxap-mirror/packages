import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicTableDataSource } from '@rxap/data-source/table';
import { RxapFormGroup } from '@rxap/forms';
import {
  RXAP_TABLE_FILTER_FORM_DEFINITION,
  TABLE_DATA_SOURCE,
} from '@rxap/material-table-system';
import { ToMethod } from '@rxap/pattern';
import {
  RXAP_WINDOW_DATA,
  RXAP_WINDOW_REF,
} from '@rxap/window-system';

import { TableSelectWindowComponent } from './table-select-window.component';
import { MockWindowRef } from './window-test-wrapper';

describe('TableSelectWindowComponent', () => {
  let component: TableSelectWindowComponent;
  let fixture: ComponentFixture<TableSelectWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TableSelectWindowComponent, NoopAnimationsModule ],
      providers: [
        {
          provide: RXAP_WINDOW_DATA,
          useValue: { columns: new Map() }
        },
        {
          provide: RXAP_WINDOW_REF,
          useValue: new MockWindowRef()
        },
        {
          provide: TABLE_DATA_SOURCE,
          useValue: new DynamicTableDataSource(ToMethod(jest.fn()))
        },
        {
          provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
          useValue: {
            rxapFormGroup: new RxapFormGroup({}, {controlId: 'filter'}),
            rxapMetadata: {controlId: 'filter'},
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSelectWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
