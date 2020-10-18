import { TestBed } from '@angular/core/testing';

import { RecorderService } from './recorder.service';
import {
  BaseDefinition,
  DefinitionMetadata
} from '@rxap/definition';
import { RXAP_RECORDER_ACTIVE } from './tokens';

describe('RecorderService', () => {
  let service: RecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide:  RXAP_RECORDER_ACTIVE,
          useValue: true
        }
      ]
    });
    service = TestBed.inject(RecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  @DefinitionMetadata({
    id: 'static'
  }, 'TestStatic', '@rxap/recorder')
  class TestStatic extends BaseDefinition<any> {}

  it('getDefinitionName', () => {

    expect(service.getDefinitionName(new TestStatic())).toBe('TestStatic');

  });

  it('getDefinitionPackage', () => {

    expect(service.getDefinitionPackageName(new TestStatic())).toBe('@rxap/recorder');

  });

});
