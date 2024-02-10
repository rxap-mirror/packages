import { nxComponentTestingPreset } from '@nx/angular/plugins/component-testing';
import { NxComponentTestingOptions } from '@nx/cypress/plugins/cypress-preset';
import { join } from 'path';

export function componentTestingPreset(pathToConfig: string, options?: NxComponentTestingOptions) {
  const component       = nxComponentTestingPreset(pathToConfig, options);
  // TODO : remove when this change in integrated into @nx/angular
  component.specPattern = [ '**/*.cy.ts' ];
  const basePath        = pathToConfig.replace(/cypress\.config\.ts$/, '');
  component.indexHtmlFile = 'cypress/support/component-index.html';
  (component.devServer as any).webpackConfig = {
    module: {
      rules: [
        {
          test: /\.(js|ts)$/,
          loader: '@jsdevtools/coverage-istanbul-loader',
          options: {esModules: true},
          enforce: 'post',
          include: [
            join(basePath, 'src'),
            // basePath,
          ],
          exclude: [
            /\.(cy|spec|stories)\.ts$/,
            /node_modules/
          ]
        }
      ]
    }
  };

  (component as any).setupNodeEvents = (on, config) => {
    console.log('setupNodeEvents for components');

    // https://github.com/bahmutov/cypress-code-coverage
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@cypress/code-coverage/task')(on, config);

    return config;
  };

  return component;
}
