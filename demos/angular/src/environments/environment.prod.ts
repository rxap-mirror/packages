import { Environment } from '@rxap/environment';

export const environment: Environment = {
  name: 'production',
  production: true,
  app: 'angular',
  serviceWorker: true,
  sentry: {
    enabled: true,
    debug: false,
  },
  config: {
    static: {
      api: {
        'service-app-angular-table': {
          'baseUrl': 'https://127-0-0-1.nip.io/api/app/angular/table',
        },
        'service-status': {
          'baseUrl': 'https://127-0-0-1.nip.io/api/status',
        },
        'service-configuration': {
          'baseUrl': 'https://127-0-0-1.nip.io/api/configuration',
        },
        'service-changelog': {
          'baseUrl': 'https://127-0-0-1.nip.io/api/changelog',
        },
        'service-user': {
          'baseUrl': 'https://127-0-0-1.nip.io/api/user',
          'statusCheck': true,
        },
      },
      themes: {
        'digitaix': {
          'density': -3,
          'typography': 'mono',
          'primaryColor': {
            'base': 'orange',
          },
          'accentColor': {
            'base': 'blue',
          },
          'warnColor': {
            'base': 'brown',
          },
        },
      },
    },
  },
};
