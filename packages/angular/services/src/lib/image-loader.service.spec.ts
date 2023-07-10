import {TestBed} from '@angular/core/testing';
import {ImageLoaderService} from './image-loader.service';

describe('@rxap/services', () => {

  describe('ImageLoaderService', () => {

    it('should create instance', () => {
      const service = TestBed.inject(ImageLoaderService);
      expect(service).not.toBeNull();
    });

    // TODO : add test for the load method

  });

});
