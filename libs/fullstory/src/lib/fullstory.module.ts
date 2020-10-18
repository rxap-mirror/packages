import {
  NgModule,
  ModuleWithProviders,
  Inject,
  Optional
} from '@angular/core';
import { FullstoryConfig } from './fullstory.config';
import {
  RXAP_FULLSTORY_CONFIG,
  RXAP_FULLSTORY_ACTIVE
} from './tokens';
import { FullstoryService } from './fullstory.service';

@NgModule()
export class FullstoryModule {

  public static forRoot(config: FullstoryConfig, active: boolean = true): ModuleWithProviders<FullstoryModule> {
    return {
      ngModule: FullstoryModule,
      providers: [
        { provide: RXAP_FULLSTORY_CONFIG, useValue: config },
        { provide: RXAP_FULLSTORY_ACTIVE, useValue: active },
      ]
    }
  }

  constructor(
    @Inject(FullstoryService)
    fullstory: FullstoryService,
    @Optional()
    @Inject(RXAP_FULLSTORY_ACTIVE)
      active: boolean,
  ) {
    if (active) {
      fullstory.init();
    }
  }

}
