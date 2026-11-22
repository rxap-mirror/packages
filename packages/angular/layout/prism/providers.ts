import { Provider } from '@angular/core';
import { FooterService } from '../src/lib/footer.service';
import { HeaderService } from '../src/lib/header.service';
import { LayoutService } from '../src/lib/layout.service';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  LayoutService,
  HeaderService,
  FooterService,
];
