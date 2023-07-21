import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { NavigationProgressBarComponent } from './navigation-progress-bar.component';

describe('NavigationProgressBarComponent', () => {
  let component: NavigationProgressBarComponent;
  let fixture: ComponentFixture<NavigationProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
             declarations: [ NavigationProgressBarComponent ],
           })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
