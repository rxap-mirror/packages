import { isDevMode, StaticProvider, inject, provideAppInitializer } from '@angular/core';
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
    provideAppInitializer(() => {
        const initializerFn = (LoadIconSetsFactory)(inject(MatIconRegistry), inject(DomSanitizer), inject(RXAP_ICON_ASSET_PATH));
        return initializerFn();
      }),
    {
      provide: RXAP_ICON_ASSET_PATH,
      useValue: pathList,
    },
  ];
}
