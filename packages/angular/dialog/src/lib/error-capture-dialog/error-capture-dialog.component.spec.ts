import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorCaptureDialogComponent } from './error-capture-dialog.component';

describe('ErrorCaptureDialogComponent', () => {
  let component: ErrorCaptureDialogComponent;
  let fixture: ComponentFixture<ErrorCaptureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ErrorCaptureDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorCaptureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
