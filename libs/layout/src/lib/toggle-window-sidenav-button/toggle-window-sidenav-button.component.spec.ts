import {
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { ToggleWindowSidenavButtonComponent } from './toggle-window-sidenav-button.component';
import { ToggleWindowSidenavButtonModule } from './toggle-window-sidenav-button.component.module';

describe('ToggleWindowSidenavButtonComponent', () => {
  let component: ToggleWindowSidenavButtonComponent;
  let fixture: ComponentFixture<ToggleWindowSidenavButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
             imports: [ ToggleWindowSidenavButtonModule ],
           })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(ToggleWindowSidenavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
