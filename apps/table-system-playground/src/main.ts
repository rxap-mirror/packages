import {
  enableProdMode,
  NgModule
} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { PlaygroundModule } from 'angular-playground';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { TranslateModule } from '@ngx-translate/core';

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
      RxapComponentSystemModule.forRoot(),
      TranslateModule.forRoot()
    ]
  });

platformBrowserDynamic()
  .bootstrapModule(PlaygroundModule);
