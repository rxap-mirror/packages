import {
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button.component';
import { CopyToClipboardButtonComponentModule } from './copy-to-clipboard-button.component.module';

describe('CopyToClipboardButtonComponent', () => {
  let component: CopyToClipboardButtonComponent;
  let fixture: ComponentFixture<CopyToClipboardButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
             imports: [ CopyToClipboardButtonComponentModule ]
           })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(CopyToClipboardButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
