import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ConfigService } from '@rxap/config';

// import { registerLocaleData } from '@angular/common';
// import localeDe from '@angular/common/locales/de';
// import localeDeExtra from '@angular/common/locales/extra/de';
//
// registerLocaleData(localeDe, 'de-DE', localeDeExtra);

console.log(`environment: '${environment.name}'`, environment);

if (environment.production) {
  enableProdMode();
}

ConfigService.Urls = [ '/config/config.json' ];

if (environment.development) {
  ConfigService.Urls.push('/config/config.development.json');
}

if (environment.production) {
  ConfigService.Urls.push('/config/config.prod.json');
}

if (environment.e2e) {
  ConfigService.Urls.push('/config/config.e2e.json');
}

if (environment.mergeRequest) {
  ConfigService.Urls.push('/config/config.merge-request.json');
}

if (environment.stable) {
  ConfigService.Urls.push('/config/config.stable.json');
}

if (environment.master) {
  ConfigService.Urls.push('/config/config.master.json');
}

if (environment.staging) {
  ConfigService.Urls.push('/config/config.staging.json');
}

if (environment.local) {
  ConfigService.Urls.push('/config/config.local.json');
}

Promise.all([ ConfigService.Load() ]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);
