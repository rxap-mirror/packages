import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ConfigService } from '@rxap/config';

if (environment.production) {
  enableProdMode();
}

ConfigService.Config = { authentication: { enabled: true } };

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
