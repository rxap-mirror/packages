import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkCellComponent } from './link-cell.component';

describe('LinkCellComponent', () => {
  let component: LinkCellComponent;
  let fixture: ComponentFixture<LinkCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
