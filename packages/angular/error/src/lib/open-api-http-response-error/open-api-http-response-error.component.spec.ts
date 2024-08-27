import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenApiHttpResponseErrorComponent } from './open-api-http-response-error.component';

describe('OpenApiHttpResponseErrorComponent', () => {
  let component: OpenApiHttpResponseErrorComponent;
  let fixture: ComponentFixture<OpenApiHttpResponseErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenApiHttpResponseErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenApiHttpResponseErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
