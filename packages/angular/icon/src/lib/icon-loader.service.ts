import {
  inject,
  Injectable,
  isDevMode,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { coerceArray } from '@rxap/utilities';
import { RXAP_ICON_ASSET_PATH } from './tokens';

@Injectable({ providedIn: 'root' })
export class IconLoaderService {

  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly pathList: string | string[] = inject(RXAP_ICON_ASSET_PATH);

  public load() {
    const pathList = coerceArray(this.pathList);
    if (isDevMode()) {
      console.debug(`load icon sets from path [ ${ pathList.join('/') } ]`);
    }
    for (const path of pathList) {
      try {
        this.matIconRegistry.addSvgIconSet(this.domSanitizer.bypassSecurityTrustResourceUrl(path));
      } catch (e: any) {
        console.error(`Could not load icon set from path ${ path }`, e.message);
      }
    }
  }

}
