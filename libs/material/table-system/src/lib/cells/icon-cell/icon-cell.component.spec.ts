import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconCellComponent } from './icon-cell.component';

describe('IconCellComponent', () => {
  let component: IconCellComponent;
  let fixture: ComponentFixture<IconCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
