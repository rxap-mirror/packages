import {
  enableProdMode,
  NgModule
} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { MatIconRegistry } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlaygroundModule } from 'angular-playground';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RxapFormSystemModule } from '@rxap/form-system';
import { RxapComponentSystemModule } from '@rxap/component-system';

if (environment.production) {
  enableProdMode();
}

@NgModule({
  imports: [ HttpClientModule ]
})
class IconModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('/assets/mdi.svg')
    );
  }
}

PlaygroundModule
  .configure({
    selector: 'rxap-root',
    overlay:  false,
    modules:  [
      BrowserAnimationsModule,
      IconModule,
      RxapFormSystemModule.forRoot(),
      RxapComponentSystemModule.forRoot()
    ]
  });

platformBrowserDynamic()
  .bootstrapModule(PlaygroundModule);
