import { TestBed } from '@angular/core/testing';

import { FormTemplatesService } from './form-templates.service';

describe('FormTemplatesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormTemplatesService = TestBed.get(FormTemplatesService);
    expect(service).toBeTruthy();
  });
});
