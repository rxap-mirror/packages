import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { TableSelectControlsComponent } from './table-select-controls.component';

describe('TableSelectControlsComponent', () => {
  let component: TableSelectControlsComponent;
  let fixture: ComponentFixture<TableSelectControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
                   declarations: [ TableSelectControlsComponent ]
                 })
                 .compileComponents();
  });

  beforeEach(() => {
    fixture   = TestBed.createComponent(TableSelectControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
