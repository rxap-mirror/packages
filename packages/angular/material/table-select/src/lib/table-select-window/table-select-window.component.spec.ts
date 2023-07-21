import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { TableSelectWindowComponent } from './table-select-window.component';

describe('TableSelectWindowComponent', () => {
  let component: TableSelectWindowComponent;
  let fixture: ComponentFixture<TableSelectWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
                   declarations: [ TableSelectWindowComponent ],
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
