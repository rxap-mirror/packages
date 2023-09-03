import { HttpClientModule } from '@angular/common/http';
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
 * @deprecated instead use the IconLoaderService - the service is automatically loaded in the LayoutComponent
 */
@NgModule({
  imports: [ HttpClientModule ],
})
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
