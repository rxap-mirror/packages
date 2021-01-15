import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { TableCreateButtonComponent } from './table-create-button.component';

describe('TableCreateButtonComponent', () => {
  let component: TableCreateButtonComponent;
  let fixture: ComponentFixture<TableCreateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
                   declarations: [ TableCreateButtonComponent ]
                 })
                 .compileComponents();
  });

  beforeEach(() => {
    fixture   = TestBed.createComponent(TableCreateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
