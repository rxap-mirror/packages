import {Inject, Injectable, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeValue} from '@angular/platform-browser';

// TODO : move to @rxap/services
@Injectable({
  providedIn: 'root',
})
export class SantizationService {
  constructor(@Inject(DomSanitizer) private _sanitizer: DomSanitizer) {
  }

  transform(
    value: string | null,
    type: 'html' | 'style' | 'script' | 'url' | 'resourceUrl' = 'url',
  ): SafeValue | null {
    if (value === null) {
      return this._sanitizer.sanitize(SecurityContext.NONE, value);
    }
    switch (type) {
      case 'html':
        return this._sanitizer.bypassSecurityTrustHtml(value);

      case 'style':
        return this._sanitizer.bypassSecurityTrustStyle(value);

      case 'script':
        return this._sanitizer.bypassSecurityTrustScript(value);

      case 'url':
        return this._sanitizer.bypassSecurityTrustUrl(value);

      case 'resourceUrl':
        return this._sanitizer.bypassSecurityTrustResourceUrl(value);
    }

    throw new Error('type is not set');
  }
}
