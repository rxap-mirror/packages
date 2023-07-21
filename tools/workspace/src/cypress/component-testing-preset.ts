import { nxComponentTestingPreset } from '@nx/angular/plugins/component-testing';
import { NxComponentTestingOptions } from '@nx/cypress/plugins/cypress-preset';

export function componentTestingPreset(pathToConfig: string, options?: NxComponentTestingOptions) {
  const component = nxComponentTestingPreset(pathToConfig, options);
  // TODO : remove when this change in integrated into @nx/angular
  // component.specPattern = [ '**/*.cy.ts' ];
  // const basePath = pathToConfig.replace(/cypress\.config\.ts$/, '');
  // component.indexHtmlFile = component.indexHtmlFile.replace(basePath, '');
  return component;
}
