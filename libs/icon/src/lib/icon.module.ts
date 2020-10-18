import {
  NgModule,
  InjectionToken,
  ModuleWithProviders,
  Inject
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export function DefaultIconSvgFilePath() {
  return '/assets/mdi.svg';
}

export const RXAP_ICON_ASSET_PATH = new InjectionToken('rxap/icon/asset-path', {
  providedIn: 'root',
  factory:    DefaultIconSvgFilePath
});

@NgModule({
  imports: [ HttpClientModule ]
})
export class IconModule {

  public static forRoot(path: string = DefaultIconSvgFilePath()): ModuleWithProviders<IconModule> {
    return {
      ngModule:  IconModule,
      providers: [
        {
          provide:  RXAP_ICON_ASSET_PATH,
          useValue: path
        }
      ]
    };
  }

  constructor(
    @Inject(MatIconRegistry) matIconRegistry: MatIconRegistry,
    @Inject(DomSanitizer) domSanitizer: DomSanitizer,
    @Inject(RXAP_ICON_ASSET_PATH) path: string
  ) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl(path));
  }

}
