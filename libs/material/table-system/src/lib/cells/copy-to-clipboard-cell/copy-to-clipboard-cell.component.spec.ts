import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyToClipboardCellComponent } from './copy-to-clipboard-cell.component';

describe('CopyToClipboardCellComponent', () => {
  let component: CopyToClipboardCellComponent;
  let fixture: ComponentFixture<CopyToClipboardCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyToClipboardCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyToClipboardCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
