import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { TableShowArchivedSlideComponent } from './table-show-archived-slide.component';

describe('TableShowArchivedSlideComponent', () => {
  let component: TableShowArchivedSlideComponent;
  let fixture: ComponentFixture<TableShowArchivedSlideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableShowArchivedSlideComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableShowArchivedSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
