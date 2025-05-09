import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutInfoComponent } from './layout-info.component';

describe('LayoutInfoComponent', () => {
  let component: LayoutInfoComponent;
  let fixture: ComponentFixture<LayoutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
