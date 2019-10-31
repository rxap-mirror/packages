import { TestBed } from '@angular/core/testing';
import { FormInstances

.
ServiceService;
}
from;
'./form-instances.service.service';

describe('FormInstances.ServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormInstances.ServiceService = TestBed.get(FormInstances.ServiceService);
    expect(service).toBeTruthy();
  });
});
