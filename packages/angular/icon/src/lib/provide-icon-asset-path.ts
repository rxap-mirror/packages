import {
  APP_INITIALIZER,
  isDevMode,
  StaticProvider,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { coerceArray } from '@rxap/utilities';
import { RXAP_ICON_ASSET_PATH } from './tokens';

export function LoadIconSetsFactory(
  matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer, pathList: string | string[],
): () => void {
  return () => {
    pathList = coerceArray(pathList);

    if (isDevMode()) {
      console.debug(`load icon sets from path [${ pathList.join(', ') }]`);
    }
    for (const path of pathList) {
      try {
        matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl(path));
      } catch (e: any) {
        console.error(`Could not load icon set from path ${ path }`, e.message);
      }
    }
  };
}

export function ProvideIconAssetPath(pathList: string[] = [
  'mdi.svg',
  'custom.svg',
]): StaticProvider {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: LoadIconSetsFactory,
      deps: [ MatIconRegistry, DomSanitizer, RXAP_ICON_ASSET_PATH ],
    },
    {
      provide: RXAP_ICON_ASSET_PATH,
      useValue: pathList,
    },
  ];
}
