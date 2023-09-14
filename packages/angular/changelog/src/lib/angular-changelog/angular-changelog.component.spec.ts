import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { AngularChangelogComponent } from './angular-changelog.component';

describe('AngularChangelogComponent', () => {
  let component: AngularChangelogComponent;
  let fixture: ComponentFixture<AngularChangelogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AngularChangelogComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularChangelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
