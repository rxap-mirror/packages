import { Injectable } from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
  SafeHtml,
  SafeStyle,
  SafeScript
} from '@angular/platform-browser';

export enum SanitizerTypes {
  HTML         = 'html',
  STYLE        = 'style',
  SCRIPT       = 'script',
  URL          = 'url',
  RESOURCE_URL = 'resourceUrl',
}

export type SanitizerType = 'html' | 'style' | 'script' | 'url' | 'resourceUrl';

@Injectable({
  providedIn: 'root'
})
export class SanitizerService {

  constructor(private readonly sanitizer: DomSanitizer) { }

  public bypass(value: string, type: SanitizerTypes | SanitizerType): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {

    switch (type) {
      case SanitizerTypes.HTML:
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case SanitizerTypes.STYLE:
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case SanitizerTypes.SCRIPT:
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case SanitizerTypes.URL:
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case SanitizerTypes.RESOURCE_URL:
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }

    throw new Error(`Invalid sanitizer type '${type}'`);

  }

}
