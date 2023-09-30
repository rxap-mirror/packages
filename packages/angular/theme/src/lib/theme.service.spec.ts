import { MediaMatcher } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import {
  ConfigService,
  ConfigTestingService,
} from '@rxap/config';
import { ThemeService } from '@rxap/ngx-theme';

describe('ThemeService', () => {

  let service: ThemeService;
  let config: ConfigTestingService;

  beforeEach(() => {
    config = new ConfigTestingService();
    TestBed
      .configureTestingModule({
        providers: [
          ThemeService,
          ConfigService,
        ],
      })
      .overrideProvider(MediaMatcher, {
        useValue: {
          matchMedia: () => (
            {
              matches: false,
              addEventListener: () => {},
            }
          ),
        },
      })
      .overrideProvider(ConfigService, { useValue: config });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

});
