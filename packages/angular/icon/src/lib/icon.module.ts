import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { IconLoaderService } from './icon-loader.service';
import {
  DefaultIconSvgFilePath,
  RXAP_ICON_ASSET_PATH,
} from './tokens';

/**
 * @deprecated use the ProvideIconAssetPath function in the app.config.ts file
 */
@NgModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class IconModule {

  constructor(
    iconLoaderService: IconLoaderService,
  ) {
    iconLoaderService.load();
  }

  public static forRoot(path: string | string[] = DefaultIconSvgFilePath()): ModuleWithProviders<IconModule> {
    return {
      ngModule: IconModule,
      providers: [
        {
          provide: RXAP_ICON_ASSET_PATH,
          useValue: path,
        },
      ],
    };
  }

}
