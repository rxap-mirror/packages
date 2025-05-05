import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentDialogComponent } from './component-dialog.component';

describe('ErrorCaptureDialogComponent', () => {
  let component: ComponentDialogComponent;
  let fixture: ComponentFixture<ComponentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
