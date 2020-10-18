import {
  NgModule,
  ModuleWithProviders,
  APP_INITIALIZER
} from '@angular/core';
import { RecorderService } from './recorder.service';
import { RXAP_RECORDER_ACTIVE } from './tokens';

export function RecorderInitializer(recorder: RecorderService) {
  return recorder.init.bind(recorder);
}

@NgModule()
export class RecorderModule {

  public static forRoot(active: boolean = true): ModuleWithProviders<RecorderModule> {
    return {
      ngModule:  RecorderModule,
      providers: [
        {
          provide:  RXAP_RECORDER_ACTIVE,
          useValue: active
        },
        {
          provide:    APP_INITIALIZER,
          useFactory: RecorderInitializer,
          deps:       [ RecorderService ],
          multi:      true
        }
      ]
    };
  }

}
