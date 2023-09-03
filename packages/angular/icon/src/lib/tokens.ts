import { InjectionToken } from '@angular/core';

export function DefaultIconSvgFilePath() {
  return 'mdi.svg';
}

export const RXAP_ICON_ASSET_PATH = new InjectionToken('rxap/icon/asset-path', {
  providedIn: 'root',
  factory: DefaultIconSvgFilePath,
});
