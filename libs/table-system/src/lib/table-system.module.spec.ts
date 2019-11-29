import {
  async,
  TestBed
} from '@angular/core/testing';
import { TableSystemModule } from './table-system.module';

describe('TableSystemModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TableSystemModule ]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TableSystemModule).toBeDefined();
  });
});
