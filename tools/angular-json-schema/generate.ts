import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { Project, QuoteKind, IndentationText } from 'ts-morph';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createDirectory } from '@nx/workspace';
import { directoryExists } from '@nrwl/nx-plugin/testing';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://angular.io/schemas/cli-1/schema',
  title: 'Angular CLI Configuration',
  type: 'object',
  properties: {
    $schema: {
      type: 'string',
    },
    version: {
      $ref: '#/definitions/fileVersion',
    },
    cli: {
      $ref: '#/definitions/cliOptions',
    },
    schematics: {
      $ref: '#/definitions/schematicOptions',
    },
    newProjectRoot: {
      type: 'string',
      description: 'Path where new projects will be created.',
    },
    defaultProject: {
      type: 'string',
      description: 'Default project name used in commands.',
    },
    projects: {
      type: 'object',
      patternProperties: {
        '^(?:@[a-zA-Z0-9_-]+/)?[a-zA-Z0-9_-]+$': {
          $ref: '#/definitions/project',
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  required: ['version'],
  definitions: {
    cliOptions: {
      type: 'object',
      properties: {
        defaultCollection: {
          description: 'The default schematics collection to use.',
          type: 'string',
        },
        packageManager: {
          description: 'Specify which package manager tool to use.',
          type: 'string',
          enum: ['npm', 'cnpm', 'yarn', 'pnpm'],
        },
        warnings: {
          description: 'Control CLI specific console warnings',
          type: 'object',
          properties: {
            versionMismatch: {
              description:
                'Show a warning when the global version is newer than the local one.',
              type: 'boolean',
            },
          },
        },
        analytics: {
          type: ['boolean', 'string'],
          description:
            'Share anonymous usage data with the Angular Team at Google.',
        },
        analyticsSharing: {
          type: 'object',
          properties: {
            tracking: {
              description: 'Analytics sharing info tracking ID.',
              type: 'string',
              pattern: '^GA-\\d+-\\d+$',
            },
            uuid: {
              description:
                'Analytics sharing info universally unique identifier.',
              type: 'string',
            },
          },
        },
      },
      additionalProperties: false,
    },
    schematicOptions: {
      type: 'object',
      properties: {
        '@schematics/angular:component': {
          type: 'object',
          properties: {
            changeDetection: {
              description: 'Specifies the change detection strategy.',
              enum: ['Default', 'OnPush'],
              type: 'string',
              default: 'Default',
              alias: 'c',
            },
            displayBlock: {
              description:
                'Specifies if the style will contain `:host { display: block; }`.',
              type: 'boolean',
              default: false,
              alias: 'b',
            },
            entryComponent: {
              type: 'boolean',
              default: false,
              description:
                'Specifies if the component is an entry component of declaring module.',
            },
            export: {
              type: 'boolean',
              default: false,
              description:
                'Specifies if declaring module exports the component.',
            },
            flat: {
              type: 'boolean',
              description: 'Flag to indicate if a directory is created.',
              default: false,
            },
            inlineStyle: {
              description: 'Specifies if the style will be in the ts file.',
              type: 'boolean',
              default: false,
              alias: 's',
            },
            inlineTemplate: {
              description: 'Specifies if the template will be in the ts file.',
              type: 'boolean',
              default: false,
              alias: 't',
            },
            module: {
              type: 'string',
              description: 'Allows specification of the declaring module.',
              alias: 'm',
            },
            prefix: {
              type: 'string',
              format: 'html-selector',
              description: 'The prefix to apply to generated selectors.',
              alias: 'p',
            },
            selector: {
              type: 'string',
              format: 'html-selector',
              description: 'The selector to use for the component.',
            },
            skipImport: {
              type: 'boolean',
              description: 'Flag to skip the module import.',
              default: false,
            },
            style: {
              description:
                'The file extension or preprocessor to use for style files.',
              type: 'string',
              default: 'css',
              enum: ['css', 'scss', 'sass', 'less', 'styl'],
            },
            viewEncapsulation: {
              description: 'Specifies the view encapsulation strategy.',
              enum: ['Emulated', 'Native', 'None', 'ShadowDom'],
              type: 'string',
              alias: 'v',
            },
            skipTests: {
              type: 'boolean',
              description: 'Do not create test files.',
              default: false,
            },
          },
        },
        '@schematics/angular:directive': {
          type: 'object',
          properties: {
            export: {
              type: 'boolean',
              default: false,
              description:
                'Specifies if declaring module exports the directive.',
            },
            flat: {
              type: 'boolean',
              description: 'Flag to indicate if a directory is created.',
              default: true,
            },
            module: {
              type: 'string',
              description: 'Allows specification of the declaring module.',
              alias: 'm',
            },
            prefix: {
              type: 'string',
              format: 'html-selector',
              description: 'The prefix to apply to generated selectors.',
              default: 'app',
              alias: 'p',
            },
            selector: {
              type: 'string',
              format: 'html-selector',
              description: 'The selector to use for the directive.',
            },
            skipImport: {
              type: 'boolean',
              description: 'Flag to skip the module import.',
              default: false,
            },
            skipTests: {
              type: 'boolean',
              description: 'Do not create test files.',
              default: false,
            },
          },
        },
        '@schematics/angular:module': {
          type: 'object',
          properties: {
            routing: {
              type: 'boolean',
              description: 'Generates a routing module.',
              default: false,
            },
            routingScope: {
              enum: ['Child', 'Root'],
              type: 'string',
              description: 'The scope for the generated routing.',
              default: 'Child',
            },
            flat: {
              type: 'boolean',
              description: 'Flag to indicate if a directory is created.',
              default: false,
            },
            commonModule: {
              type: 'boolean',
              description:
                'Flag to control whether the CommonModule is imported.',
              default: true,
              visible: false,
            },
            module: {
              type: 'string',
              description: 'Allows specification of the declaring module.',
              alias: 'm',
            },
          },
        },
        '@schematics/angular:service': {
          type: 'object',
          properties: {
            flat: {
              type: 'boolean',
              default: true,
              description: 'Flag to indicate if a directory is created.',
            },
            skipTests: {
              type: 'boolean',
              description: 'Do not create test files.',
              default: false,
            },
          },
        },
        '@schematics/angular:pipe': {
          type: 'object',
          properties: {
            flat: {
              type: 'boolean',
              default: true,
              description: 'Flag to indicate if a directory is created.',
            },
            skipTests: {
              type: 'boolean',
              description: 'Do not create test files.',
              default: false,
            },
            skipImport: {
              type: 'boolean',
              default: false,
              description: 'Allows for skipping the module import.',
            },
            module: {
              type: 'string',
              default: '',
              description: 'Allows specification of the declaring module.',
              alias: 'm',
            },
            export: {
              type: 'boolean',
              default: false,
              description: 'Specifies if declaring module exports the pipe.',
            },
          },
        },
        '@schematics/angular:class': {
          type: 'object',
          properties: {
            skipTests: {
              type: 'boolean',
              description: 'Do not create test files.',
              default: false,
            },
          },
        },
      },
      additionalProperties: {
        type: 'object',
      },
    },
    fileVersion: {
      type: 'integer',
      description: 'File format version',
      minimum: 1,
    },
    project: {
      type: 'object',
      properties: {
        cli: {
          $ref: '#/definitions/cliOptions',
        },
        schematics: {
          $ref: '#/definitions/schematicOptions',
        },
        prefix: {
          type: 'string',
          format: 'html-selector',
          description: 'The prefix to apply to generated selectors.',
        },
        root: {
          type: 'string',
          description: 'Root of the project files.',
        },
        i18n: {
          $ref: '#/definitions/project/definitions/i18n',
        },
        sourceRoot: {
          type: 'string',
          description:
            'The root of the source files, assets and index.html file structure.',
        },
        projectType: {
          type: 'string',
          description: 'Project type.',
          enum: ['application', 'library'],
        },
        architect: {
          type: 'object',
          additionalProperties: {
            $ref: '#/definitions/project/definitions/target',
          },
        },
        targets: {
          type: 'object',
          additionalProperties: {
            $ref: '#/definitions/project/definitions/target',
          },
        },
      },
      required: ['root', 'projectType'],
      anyOf: [
        {
          required: ['architect'],
          not: {
            required: ['targets'],
          },
        },
        {
          required: ['targets'],
          not: {
            required: ['architect'],
          },
        },
        {
          not: {
            required: ['targets', 'architect'],
          },
        },
      ],
      additionalProperties: false,
      patternProperties: {
        '^[a-z]{1,3}-.*': {},
      },
      definitions: {
        i18n: {
          description: 'Project i18n options',
          type: 'object',
          properties: {
            sourceLocale: {
              oneOf: [
                {
                  type: 'string',
                  description:
                    'Specifies the source locale of the application.',
                  default: 'en-US',
                  $comment: 'IETF BCP 47 language tag (simplified)',
                  pattern:
                    '^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-[a-zA-Z]{5,8})?(-x(-[a-zA-Z0-9]{1,8})+)?$',
                },
                {
                  type: 'object',
                  description:
                    'Localization options to use for the source locale',
                  properties: {
                    code: {
                      type: 'string',
                      description:
                        'Specifies the locale code of the source locale',
                      pattern:
                        '^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-[a-zA-Z]{5,8})?(-x(-[a-zA-Z0-9]{1,8})+)?$',
                    },
                    baseHref: {
                      type: 'string',
                      description:
                        'HTML base HREF to use for the locale (defaults to the locale code)',
                    },
                  },
                  additionalProperties: false,
                },
              ],
            },
            locales: {
              type: 'object',
              additionalProperties: false,
              patternProperties: {
                '^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-[a-zA-Z]{5,8})?(-x(-[a-zA-Z0-9]{1,8})+)?$':
                  {
                    oneOf: [
                      {
                        type: 'string',
                        description: 'Localization file to use for i18n',
                      },
                      {
                        type: 'array',
                        description: 'Localization files to use for i18n',
                        items: {
                          type: 'string',
                          uniqueItems: true,
                        },
                      },
                      {
                        type: 'object',
                        description:
                          'Localization options to use for the locale',
                        properties: {
                          translation: {
                            oneOf: [
                              {
                                type: 'string',
                                description:
                                  'Localization file to use for i18n',
                              },
                              {
                                type: 'array',
                                description:
                                  'Localization files to use for i18n',
                                items: {
                                  type: 'string',
                                  uniqueItems: true,
                                },
                              },
                            ],
                          },
                          baseHref: {
                            type: 'string',
                            description:
                              'HTML base HREF to use for the locale (defaults to the locale code)',
                          },
                        },
                        additionalProperties: false,
                      },
                    ],
                  },
              },
            },
          },
          additionalProperties: false,
        },
        target: {
          oneOf: [
            {
              $comment: 'Extendable target with custom builder',
              type: 'object',
              properties: {
                builder: {
                  type: 'string',
                  description: 'The builder used for this package.',
                  not: {
                    enum: [
                      '@angular-devkit/build-angular:app-shell',
                      '@angular-devkit/build-angular:browser',
                      '@angular-devkit/build-angular:dev-server',
                      '@angular-devkit/build-angular:extract-i18n',
                      '@angular-devkit/build-angular:karma',
                      '@angular-devkit/build-angular:protractor',
                      '@angular-devkit/build-angular:server',
                      '@angular-devkit/build-angular:tslint',
                      '@angular-devkit/build-angular:ng-packagr',
                    ],
                  },
                },
                options: {
                  type: 'object',
                },
                configurations: {
                  type: 'object',
                  description: 'A map of alternative target options.',
                  additionalProperties: {
                    type: 'object',
                  },
                },
              },
              required: ['builder'],
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:app-shell' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/appShell',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/appShell',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:browser' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/browser',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/browser',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:dev-server' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/devServer',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/devServer',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: {
                  const: '@angular-devkit/build-angular:extract-i18n',
                },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/extracti18n',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/extracti18n',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:karma' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/karma',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/karma',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:protractor' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/protractor',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/protractor',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:server' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/server',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/server',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:tslint' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/tslint',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/tslint',
                  },
                },
              },
            },
            {
              type: 'object',
              properties: {
                builder: { const: '@angular-devkit/build-angular:ng-packagr' },
                options: {
                  $ref: '#/definitions/targetOptions/definitions/ngPackagr',
                },
                configurations: {
                  type: 'object',
                  additionalProperties: {
                    $ref: '#/definitions/targetOptions/definitions/ngPackagr',
                  },
                },
              },
            },
          ],
        },
      },
    },
    global: {
      type: 'object',
      properties: {
        $schema: {
          type: 'string',
          format: 'uri',
        },
        version: {
          $ref: '#/definitions/fileVersion',
        },
        cli: {
          $ref: '#/definitions/cliOptions',
        },
        schematics: {
          $ref: '#/definitions/schematicOptions',
        },
      },
      required: ['version'],
    },
    targetOptions: {
      type: 'null',
      definitions: {
        appShell: {
          description: 'App Shell target options for Architect.',
          type: 'object',
          properties: {
            browserTarget: {
              type: 'string',
              description:
                'A browser builder target to use for rendering the app shell in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`.',
            },
            serverTarget: {
              type: 'string',
              description:
                'A server builder target to use for rendering the app shell in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`.',
            },
            appModuleBundle: {
              type: 'string',
              description:
                "Script that exports the Server AppModule to render. This should be the main JavaScript outputted by the server target. By default we will resolve the outputPath of the serverTarget and find a bundle named 'main' in it (whether or not there's a hash tag).",
            },
            route: {
              type: 'string',
              description: 'The route to render.',
              default: '/',
            },
            inputIndexPath: {
              type: 'string',
              description:
                'The input path for the index.html file. By default uses the output index.html of the browser target.',
            },
            outputIndexPath: {
              type: 'string',
              description:
                'The output path of the index.html file. By default will overwrite the input file.',
            },
          },
          additionalProperties: false,
        },
        browser: {
          title: 'Webpack browser schema for Architect.',
          description: 'Browser target options',
          properties: {
            assets: {
              type: 'array',
              description: 'List of static application assets.',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/browser/definitions/assetPattern',
              },
            },
            main: {
              type: 'string',
              description: 'The name of the main entry-point file.',
            },
            polyfills: {
              type: 'string',
              description: 'The name of the polyfills file.',
            },
            tsConfig: {
              type: 'string',
              description: 'The name of the TypeScript configuration file.',
            },
            scripts: {
              description: 'Global scripts to be included in the build.',
              type: 'array',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/browser/definitions/extraEntryPoint',
              },
            },
            styles: {
              description: 'Global styles to be included in the build.',
              type: 'array',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/browser/definitions/extraEntryPoint',
              },
            },
            stylePreprocessorOptions: {
              description: 'Options to pass to style preprocessors.',
              type: 'object',
              properties: {
                includePaths: {
                  description:
                    'Paths to include. Paths will be resolved to project root.',
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  default: [],
                },
              },
              additionalProperties: false,
            },
            optimization: {
              description:
                'Enables optimization of the build output. Including minification of scripts and styles, tree-shaking, dead-code elimination, inlining of critical CSS and fonts inlining. For more information, see https://angular.io/guide/workspace-config#optimization-configuration.',
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description:
                        'Enables optimization of the scripts output.',
                      default: true,
                    },
                    styles: {
                      description: 'Enables optimization of the styles output.',
                      default: true,
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            minify: {
                              type: 'boolean',
                              description:
                                'Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers and minimizing values.',
                              default: true,
                            },
                            inlineCritical: {
                              type: 'boolean',
                              description:
                                'Extract and inline critical CSS definitions to improve first paint time.',
                              default: false,
                            },
                          },
                          additionalProperties: false,
                        },
                        {
                          type: 'boolean',
                        },
                      ],
                    },
                    fonts: {
                      description:
                        'Enables optimization for fonts. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server.',
                      default: true,
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            inline: {
                              type: 'boolean',
                              description:
                                "Reduce render blocking requests by inlining external Google fonts and icons CSS definitions in the application's HTML index file. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server.",
                              default: true,
                            },
                          },
                          additionalProperties: false,
                        },
                        {
                          type: 'boolean',
                        },
                      ],
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            fileReplacements: {
              description:
                'Replace compilation source files with other compilation source files in the build.',
              type: 'array',
              items: {
                $ref: '#/definitions/targetOptions/definitions/browser/definitions/fileReplacement',
              },
              default: [],
            },
            outputPath: {
              type: 'string',
              description: 'Path where output will be placed.',
            },
            resourcesOutputPath: {
              type: 'string',
              description:
                'The path where style resources will be placed, relative to outputPath.',
            },
            aot: {
              type: 'boolean',
              description: 'Build using Ahead of Time compilation.',
              default: false,
            },
            sourceMap: {
              description:
                'Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration.',
              default: true,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description: 'Output source maps for all scripts.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Output source maps for all styles.',
                      default: true,
                    },
                    hidden: {
                      type: 'boolean',
                      description:
                        'Output source maps used for error reporting tools.',
                      default: false,
                    },
                    vendor: {
                      type: 'boolean',
                      description: 'Resolve vendor packages source maps.',
                      default: false,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            vendorChunk: {
              type: 'boolean',
              description:
                'Generate a seperate bundle containing only vendor libraries. This option should only used for development.',
              default: true,
            },
            commonChunk: {
              type: 'boolean',
              description:
                'Generate a seperate bundle containing code used across multiple bundles.',
              default: true,
            },
            baseHref: {
              type: 'string',
              description: 'Base url for the application being built.',
            },
            deployUrl: {
              type: 'string',
              description: 'URL where files will be deployed.',
            },
            verbose: {
              type: 'boolean',
              description: 'Adds more details to output logging.',
              default: false,
            },
            progress: {
              type: 'boolean',
              description: 'Log progress to the console while building.',
              default: true,
            },
            localize: {
              $ref: '#/definitions/buildersOptions/localize',
            },
            i18nMissingTranslation: {
              $ref: '#/definitions/buildersOptions/missingTranslation',
            },
            i18nFile: {
              type: 'string',
              description: 'Localization file to use for i18n.',
              'x-deprecated': 'Deprecated since 9.0.',
            },
            i18nFormat: {
              type: 'string',
              description:
                'Format of the localization file specified with --i18n-file.',
              'x-deprecated': 'Deprecated since 9.0.',
            },
            i18nLocale: {
              type: 'string',
              description: 'Locale to use for i18n.',
              'x-deprecated': 'Deprecated since 9.0.',
            },
            extractCss: {
              type: 'boolean',
              description:
                "Extract CSS from global styles into '.css' files instead of '.js'.",
              default: true,
            },
            watch: {
              type: 'boolean',
              description: 'Run build when files change.',
              default: false,
            },
            outputHashing: {
              type: 'string',
              description:
                'Define the output filename cache-busting hashing mode.',
              default: 'none',
              enum: ['none', 'all', 'media', 'bundles'],
            },
            poll: {
              type: 'number',
              description:
                'Enable and define the file watching poll time period in milliseconds.',
            },
            deleteOutputPath: {
              type: 'boolean',
              description: 'Delete the output path before building.',
              default: true,
            },
            preserveSymlinks: {
              type: 'boolean',
              description: 'Do not use the real path when resolving modules.',
            },
            extractLicenses: {
              type: 'boolean',
              description:
                'Extract all licenses in a separate file, in the case of production builds only.',
              default: true,
            },
            showCircularDependencies: {
              type: 'boolean',
              description: 'Show circular dependency warnings on builds.',
              default: true,
            },
            buildOptimizer: {
              type: 'boolean',
              description:
                "Enables @angular-devkit/build-optimizer optimizations when using the 'aot' option.",
              default: false,
            },
            namedChunks: {
              type: 'boolean',
              description: 'Use file name for lazy loaded chunks.',
              default: true,
            },
            subresourceIntegrity: {
              type: 'boolean',
              description:
                'Enables the use of subresource integrity validation.',
              default: false,
            },
            serviceWorker: {
              type: 'boolean',
              description:
                'Generates a service worker config for production builds.',
              default: false,
            },
            ngswConfigPath: {
              type: 'string',
              description: 'Path to ngsw-config.json.',
            },
            index: {
              description:
                "Configures the generation of the application's HTML index.",
              oneOf: [
                {
                  type: 'string',
                  description:
                    "The path of a file to use for the application's HTML index. The filename of the specified path will be used for the generated file and will be created in the root of the application's configured output path.",
                },
                {
                  type: 'object',
                  description: '',
                  properties: {
                    input: {
                      type: 'string',
                      minLength: 1,
                      description:
                        "The path of a file to use for the application's generated HTML index.",
                    },
                    output: {
                      type: 'string',
                      minLength: 1,
                      default: 'index.html',
                      description:
                        "The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path.",
                    },
                  },
                  required: ['input'],
                },
              ],
            },
            statsJson: {
              type: 'boolean',
              description:
                "Generates a 'stats.json' file which can be analyzed using tools such as 'webpack-bundle-analyzer'.",
              default: false,
            },
            forkTypeChecker: {
              type: 'boolean',
              description:
                'Run the TypeScript type checker in a forked process.',
              default: true,
            },
            lazyModules: {
              description:
                'List of additional NgModule files that will be lazy loaded. Lazy router modules will be discovered automatically.',
              type: 'array',
              items: {
                type: 'string',
              },
              default: [],
            },
            budgets: {
              description:
                'Budget thresholds to ensure parts of your application stay within boundaries which you set.',
              type: 'array',
              items: {
                $ref: '#/definitions/targetOptions/definitions/browser/definitions/budget',
              },
              default: [],
            },
            webWorkerTsConfig: {
              type: 'string',
              description: 'TypeScript configuration for Web Worker modules.',
            },
            crossOrigin: {
              type: 'string',
              description:
                'Define the crossorigin attribute setting of elements that provide CORS support.',
              default: 'none',
              enum: ['none', 'anonymous', 'use-credentials'],
            },
            experimentalRollupPass: {
              type: 'boolean',
              description:
                'Concatenate modules with Rollup before bundling them with Webpack.',
              default: false,
            },
            allowedCommonJsDependencies: {
              description:
                'A list of CommonJS packages that are allowed to be used without a build time warning.',
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          additionalProperties: false,
          definitions: {
            assetPattern: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    followSymlinks: {
                      type: 'boolean',
                      default: false,
                      description:
                        'Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched.',
                    },
                    glob: {
                      type: 'string',
                      description: 'The pattern to match.',
                    },
                    input: {
                      type: 'string',
                      description:
                        "The input path dir in which to apply 'glob'. Defaults to the project root.",
                    },
                    output: {
                      type: 'string',
                      description: 'Absolute path within the output.',
                    },
                    ignore: {
                      description: 'An array of globs to ignore.',
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                  additionalProperties: false,
                  required: ['glob', 'input', 'output'],
                },
                {
                  type: 'string',
                  description: 'The file to include.',
                },
              ],
            },
            fileReplacement: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    src: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                    replaceWith: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                  },
                  additionalProperties: false,
                  required: ['src', 'replaceWith'],
                },
                {
                  type: 'object',
                  properties: {
                    replace: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                    with: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                  },
                  additionalProperties: false,
                  required: ['replace', 'with'],
                },
              ],
            },
            extraEntryPoint: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'The file to include.',
                    },
                    bundleName: {
                      type: 'string',
                      description:
                        'The bundle name for this extra entry point.',
                    },
                    inject: {
                      type: 'boolean',
                      description:
                        'If the bundle will be referenced in the HTML file.',
                      default: true,
                    },
                  },
                  additionalProperties: false,
                  required: ['input'],
                },
                {
                  type: 'string',
                  description: 'The file to include.',
                },
              ],
            },
            budget: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'The type of budget.',
                  enum: [
                    'all',
                    'allScript',
                    'any',
                    'anyScript',
                    'anyComponentStyle',
                    'bundle',
                    'initial',
                  ],
                },
                name: {
                  type: 'string',
                  description: 'The name of the bundle.',
                },
                baseline: {
                  type: 'string',
                  description: 'The baseline size for comparison.',
                },
                maximumWarning: {
                  type: 'string',
                  description:
                    'The maximum threshold for warning relative to the baseline.',
                },
                maximumError: {
                  type: 'string',
                  description:
                    'The maximum threshold for error relative to the baseline.',
                },
                minimumWarning: {
                  type: 'string',
                  description:
                    'The minimum threshold for warning relative to the baseline.',
                },
                minimumError: {
                  type: 'string',
                  description:
                    'The minimum threshold for error relative to the baseline.',
                },
                warning: {
                  type: 'string',
                  description:
                    'The threshold for warning relative to the baseline (min & max).',
                },
                error: {
                  type: 'string',
                  description:
                    'The threshold for error relative to the baseline (min & max).',
                },
              },
              additionalProperties: false,
              required: ['type'],
            },
          },
        },
        devServer: {
          description: 'Dev Server target options for Architect.',
          type: 'object',
          properties: {
            browserTarget: {
              type: 'string',
              description:
                'A browser builder target to serve in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`.',
            },
            port: {
              type: 'number',
              description: 'Port to listen on.',
              default: 4200,
            },
            host: {
              type: 'string',
              description: 'Host to listen on.',
              default: 'localhost',
            },
            headers: {
              type: 'object',
              description: 'Custom HTTP headers to be added to all responses.',
              propertyNames: {
                pattern: '^[-_A-Za-z0-9]+$',
              },
              additionalProperties: {
                type: 'string',
              },
            },
            proxyConfig: {
              type: 'string',
              description: 'Proxy configuration file.',
            },
            ssl: {
              type: 'boolean',
              description: 'Serve using HTTPS.',
              default: false,
            },
            sslKey: {
              type: 'string',
              description: 'SSL key to use for serving HTTPS.',
            },
            sslCert: {
              type: 'string',
              description: 'SSL certificate to use for serving HTTPS.',
            },
            open: {
              type: 'boolean',
              description: 'Open the live-reload URL in default browser.',
              default: false,
              alias: 'o',
            },
            liveReload: {
              type: 'boolean',
              description: 'Reload the page on change using live-reload.',
              default: true,
            },
            publicHost: {
              type: 'string',
              description:
                'The URL that the browser client (or live-reload client, if enabled) should use to connect to the development server. Use for a complex dev server setup, such as one with reverse proxies.',
            },
            allowedHosts: {
              type: 'array',
              description:
                'List of hosts that are allowed to access the dev server.',
              default: [],
              items: {
                type: 'string',
              },
            },
            servePath: {
              type: 'string',
              description: 'The pathname where the app will be served.',
            },
            disableHostCheck: {
              type: 'boolean',
              description:
                'Do not verify that connected clients are part of allowed hosts.',
              default: false,
            },
            hmr: {
              type: 'boolean',
              description: 'Enable hot module replacement.',
              default: false,
            },
            watch: {
              type: 'boolean',
              description: 'Rebuild on change.',
              default: true,
            },
            hmrWarning: {
              type: 'boolean',
              description: 'Show a warning when the --hmr option is enabled.',
              default: true,
            },
            servePathDefaultWarning: {
              type: 'boolean',
              description:
                'Show a warning when deploy-url/base-href use unsupported serve path values.',
              default: true,
            },
            optimization: {
              description:
                'Enables optimization of the build output. Including minification of scripts and styles, tree-shaking, dead-code elimination and fonts inlining. For more information, see https://angular.io/guide/workspace-config#optimization-configuration.',
              default: false,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description: 'Enable optimization of the scripts output.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Enable optimization of the styles output.',
                      default: true,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            aot: {
              type: 'boolean',
              description: 'Build using ahead-of-time compilation.',
            },
            sourceMap: {
              description:
                'Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration.',
              default: true,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description: 'Output source maps for all scripts.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Output source maps for all styles.',
                      default: true,
                    },
                    vendor: {
                      type: 'boolean',
                      description: 'Resolve vendor packages source maps.',
                      default: false,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            vendorChunk: {
              type: 'boolean',
              description:
                'Generate a seperate bundle containing only vendor libraries. This option should only used for development.',
            },
            commonChunk: {
              type: 'boolean',
              description:
                'Generate a seperate bundle containing code used across multiple bundles.',
            },
            baseHref: {
              type: 'string',
              description: 'Base url for the application being built.',
            },
            deployUrl: {
              type: 'string',
              description: 'URL where files will be deployed.',
            },
            verbose: {
              type: 'boolean',
              description: 'Add more details to output logging.',
            },
            progress: {
              type: 'boolean',
              description: 'Log progress to the console while building.',
            },
          },
          additionalProperties: false,
        },
        extracti18n: {
          description: 'Extract i18n target options for Architect.',
          type: 'object',
          properties: {
            browserTarget: {
              type: 'string',
              description:
                'A browser builder target to extract i18n messages in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`.',
            },
            format: {
              type: 'string',
              description: 'Output format for the generated file.',
              default: 'xlf',
              enum: [
                'xmb',
                'xlf',
                'xlif',
                'xliff',
                'xlf2',
                'xliff2',
                'json',
                'arb',
              ],
            },
            i18nFormat: {
              type: 'string',
              description: 'Output format for the generated file.',
              default: 'xlf',
              'x-deprecated': "Use 'format' option instead.",
              enum: [
                'xmb',
                'xlf',
                'xlif',
                'xliff',
                'xlf2',
                'xliff2',
                'json',
                'arb',
              ],
            },
            i18nLocale: {
              type: 'string',
              description: 'Specifies the source language of the application.',
              'x-deprecated':
                "Use 'i18n' project level sub-option 'sourceLocale' instead.",
            },
            ivy: {
              type: 'boolean',
              description: 'Use Ivy compiler to extract translations.',
            },
            progress: {
              type: 'boolean',
              description: 'Log progress to the console.',
              default: true,
            },
            outputPath: {
              type: 'string',
              description: 'Path where output will be placed.',
            },
            outFile: {
              type: 'string',
              description: 'Name of the file to output.',
            },
          },
          additionalProperties: false,
        },
        karma: {
          description: 'Karma target options for Architect.',
          type: 'object',
          properties: {
            main: {
              type: 'string',
              description: 'The name of the main entry-point file.',
            },
            tsConfig: {
              type: 'string',
              description: 'The name of the TypeScript configuration file.',
            },
            karmaConfig: {
              type: 'string',
              description: 'The name of the Karma configuration file.',
            },
            polyfills: {
              type: 'string',
              description: 'The name of the polyfills file.',
            },
            assets: {
              type: 'array',
              description: 'List of static application assets.',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/karma/definitions/assetPattern',
              },
            },
            scripts: {
              description: 'Global scripts to be included in the build.',
              type: 'array',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/karma/definitions/extraEntryPoint',
              },
            },
            styles: {
              description: 'Global styles to be included in the build.',
              type: 'array',
              default: [],
              items: {
                $ref: '#/definitions/targetOptions/definitions/karma/definitions/extraEntryPoint',
              },
            },
            stylePreprocessorOptions: {
              description: 'Options to pass to style preprocessors',
              type: 'object',
              properties: {
                includePaths: {
                  description:
                    'Paths to include. Paths will be resolved to project root.',
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  default: [],
                },
              },
              additionalProperties: false,
            },
            sourceMap: {
              description:
                'Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration.',
              default: true,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description: 'Output source maps for all scripts.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Output source maps for all styles.',
                      default: true,
                    },
                    vendor: {
                      type: 'boolean',
                      description: 'Resolve vendor packages source maps.',
                      default: false,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            progress: {
              type: 'boolean',
              description: 'Log progress to the console while building.',
              default: true,
            },
            watch: {
              type: 'boolean',
              description: 'Run build when files change.',
              default: true,
            },
            poll: {
              type: 'number',
              description:
                'Enable and define the file watching poll time period in milliseconds.',
            },
            preserveSymlinks: {
              type: 'boolean',
              description: 'Do not use the real path when resolving modules.',
            },
            browsers: {
              type: 'string',
              description: 'Override which browsers tests are run against.',
            },
            codeCoverage: {
              type: 'boolean',
              description: 'Output a code coverage report.',
              default: false,
            },
            codeCoverageExclude: {
              type: 'array',
              description: 'Globs to exclude from code coverage.',
              items: {
                type: 'string',
              },
              default: [],
            },
            fileReplacements: {
              description:
                'Replace compilation source files with other compilation source files in the build.',
              type: 'array',
              items: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      src: {
                        type: 'string',
                      },
                      replaceWith: {
                        type: 'string',
                      },
                    },
                    additionalProperties: false,
                    required: ['src', 'replaceWith'],
                  },
                  {
                    type: 'object',
                    properties: {
                      replace: {
                        type: 'string',
                      },
                      with: {
                        type: 'string',
                      },
                    },
                    additionalProperties: false,
                    required: ['replace', 'with'],
                  },
                ],
              },
              default: [],
            },
            reporters: {
              type: 'array',
              description:
                'Karma reporters to use. Directly passed to the karma runner.',
              items: {
                type: 'string',
              },
            },
            webWorkerTsConfig: {
              type: 'string',
              description: 'TypeScript configuration for Web Worker modules.',
            },
          },
          additionalProperties: false,
          definitions: {
            assetPattern: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    followSymlinks: {
                      type: 'boolean',
                      default: false,
                      description:
                        'Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched.',
                    },
                    glob: {
                      type: 'string',
                      description: 'The pattern to match.',
                    },
                    input: {
                      type: 'string',
                      description:
                        "The input path dir in which to apply 'glob'. Defaults to the project root.",
                    },
                    output: {
                      type: 'string',
                      description: 'Absolute path within the output.',
                    },
                    ignore: {
                      description: 'An array of globs to ignore.',
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                  additionalProperties: false,
                  required: ['glob', 'input', 'output'],
                },
                {
                  type: 'string',
                  description: 'The file to include.',
                },
              ],
            },
            extraEntryPoint: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    input: {
                      type: 'string',
                      description: 'The file to include.',
                    },
                    bundleName: {
                      type: 'string',
                      description:
                        'The bundle name for this extra entry point.',
                    },
                    inject: {
                      type: 'boolean',
                      description:
                        'If the bundle will be referenced in the HTML file.',
                      default: true,
                    },
                  },
                  additionalProperties: false,
                  required: ['input'],
                },
                {
                  type: 'string',
                  description: 'The file to include.',
                },
              ],
            },
          },
        },
        protractor: {
          description: 'Protractor target options for Architect.',
          type: 'object',
          properties: {
            protractorConfig: {
              type: 'string',
              description: 'The name of the Protractor configuration file.',
            },
            devServerTarget: {
              type: 'string',
              description:
                'A dev-server builder target to run tests against in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`.',
            },
            grep: {
              type: 'string',
              description:
                'Execute specs whose names match the pattern, which is internally compiled to a RegExp.',
            },
            invertGrep: {
              type: 'boolean',
              description:
                "Invert the selection specified by the 'grep' option.",
              default: false,
            },
            specs: {
              type: 'array',
              description: 'Override specs in the protractor config.',
              default: [],
              items: {
                type: 'string',
                description: 'Spec name.',
              },
            },
            suite: {
              type: 'string',
              description: 'Override suite in the protractor config.',
            },
            webdriverUpdate: {
              type: 'boolean',
              description: 'Try to update webdriver.',
              default: true,
            },
            serve: {
              type: 'boolean',
              description: 'Compile and Serve the app.',
              default: true,
            },
            port: {
              type: 'number',
              description: 'The port to use to serve the application.',
            },
            host: {
              type: 'string',
              description: 'Host to listen on.',
              default: 'localhost',
            },
            baseUrl: {
              type: 'string',
              description: 'Base URL for protractor to connect to.',
            },
          },
          additionalProperties: false,
        },
        server: {
          title: 'Angular Webpack Architect Builder Schema',
          properties: {
            main: {
              type: 'string',
              description: 'The name of the main entry-point file.',
            },
            tsConfig: {
              type: 'string',
              default: 'tsconfig.app.json',
              description: 'The name of the TypeScript configuration file.',
            },
            stylePreprocessorOptions: {
              description: 'Options to pass to style preprocessors',
              type: 'object',
              properties: {
                includePaths: {
                  description:
                    'Paths to include. Paths will be resolved to project root.',
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  default: [],
                },
              },
              additionalProperties: false,
            },
            optimization: {
              description:
                'Enables optimization of the build output. Including minification of scripts and styles, tree-shaking and dead-code elimination. For more information, see https://angular.io/guide/workspace-config#optimization-configuration.',
              default: false,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description:
                        'Enables optimization of the scripts output.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Enables optimization of the styles output.',
                      default: true,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            fileReplacements: {
              description:
                'Replace compilation source files with other compilation source files in the build.',
              type: 'array',
              items: {
                $ref: '#/definitions/targetOptions/definitions/server/definitions/fileReplacement',
              },
              default: [],
            },
            outputPath: {
              type: 'string',
              description: 'Path where output will be placed.',
            },
            resourcesOutputPath: {
              type: 'string',
              description:
                'The path where style resources will be placed, relative to outputPath.',
            },
            sourceMap: {
              description:
                'Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration.',
              default: true,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    scripts: {
                      type: 'boolean',
                      description: 'Output source maps for all scripts.',
                      default: true,
                    },
                    styles: {
                      type: 'boolean',
                      description: 'Output source maps for all styles.',
                      default: true,
                    },
                    hidden: {
                      type: 'boolean',
                      description:
                        'Output source maps used for error reporting tools.',
                      default: false,
                    },
                    vendor: {
                      type: 'boolean',
                      description: 'Resolve vendor packages source maps.',
                      default: false,
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'boolean',
                },
              ],
            },
            verbose: {
              type: 'boolean',
              description: 'Adds more details to output logging.',
              default: false,
            },
            progress: {
              type: 'boolean',
              description: 'Log progress to the console while building.',
              default: true,
            },
            localize: {
              $ref: '#/definitions/buildersOptions/localize',
            },
            i18nFile: {
              type: 'string',
              description: 'Localization file to use for i18n.',
              'x-deprecated': 'Deprecated since 9.0',
            },
            i18nFormat: {
              type: 'string',
              description:
                'Format of the localization file specified with --i18n-file.',
              'x-deprecated': 'Deprecated since 9.0',
            },
            i18nLocale: {
              type: 'string',
              description: 'Locale to use for i18n.',
              'x-deprecated': 'Deprecated since 9.0',
            },
            i18nMissingTranslation: {
              $ref: '#/definitions/buildersOptions/missingTranslation',
            },
            outputHashing: {
              type: 'string',
              description:
                'Define the output filename cache-busting hashing mode.',
              default: 'none',
              enum: ['none', 'all', 'media', 'bundles'],
            },
            deleteOutputPath: {
              type: 'boolean',
              description: 'delete-output-path',
              default: true,
            },
            preserveSymlinks: {
              type: 'boolean',
              description: 'Do not use the real path when resolving modules.',
            },
            extractLicenses: {
              type: 'boolean',
              description:
                'Extract all licenses in a separate file, in the case of production builds only.',
              default: true,
            },
            showCircularDependencies: {
              type: 'boolean',
              description: 'Show circular dependency warnings on builds.',
              default: true,
            },
            namedChunks: {
              type: 'boolean',
              description: 'Use file name for lazy loaded chunks.',
              default: true,
            },
            bundleDependencies: {
              description:
                'Available on server platform only. Which external dependencies to bundle into the module. By default, all of node_modules will be bundled.',
              default: true,
              oneOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'string',
                  enum: ['none', 'all'],
                },
              ],
            },
            externalDependencies: {
              description:
                'Exclude the listed external dependencies from being bundled into the bundle. Instead, the created bundle relies on these dependencies to be available during runtime.',
              type: 'array',
              items: {
                type: 'string',
              },
              default: [],
            },
            statsJson: {
              type: 'boolean',
              description:
                "Generates a 'stats.json' file which can be analyzed using tools such as 'webpack-bundle-analyzer'.",
              default: false,
            },
            forkTypeChecker: {
              type: 'boolean',
              description:
                'Run the TypeScript type checker in a forked process.',
              default: true,
            },
            lazyModules: {
              description:
                'List of additional NgModule files that will be lazy loaded. Lazy router modules with be discovered automatically.',
              type: 'array',
              items: {
                type: 'string',
              },
              default: [],
            },
          },
          additionalProperties: false,
          definitions: {
            fileReplacement: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    src: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                    replaceWith: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                  },
                  additionalProperties: false,
                  required: ['src', 'replaceWith'],
                },
                {
                  type: 'object',
                  properties: {
                    replace: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                    with: {
                      type: 'string',
                      pattern: '\\.(([cm]?j|t)sx?|json)$',
                    },
                  },
                  additionalProperties: false,
                  required: ['replace', 'with'],
                },
              ],
            },
          },
        },
        tslint: {
          description: 'TSlint target options for Architect.',
          type: 'object',
          properties: {
            tslintConfig: {
              type: 'string',
              description: 'The name of the TSLint configuration file.',
            },
            tsConfig: {
              description: 'The name of the TypeScript configuration file.',
              oneOf: [
                { type: 'string' },
                {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              ],
            },
            fix: {
              type: 'boolean',
              description: 'Fixes linting errors (may overwrite linted files).',
              default: false,
            },
            typeCheck: {
              type: 'boolean',
              description: 'Controls the type check for linting.',
              default: false,
            },
            force: {
              type: 'boolean',
              description: 'Succeeds even if there was linting errors.',
              default: false,
            },
            silent: {
              type: 'boolean',
              description: 'Show output text.',
              default: false,
            },
            format: {
              type: 'string',
              description:
                'Output format (prose, json, stylish, verbose, pmd, msbuild, checkstyle, vso, fileslist, codeFrame).',
              default: 'stylish',
              anyOf: [
                {
                  enum: [
                    'checkstyle',
                    'codeFrame',
                    'filesList',
                    'json',
                    'junit',
                    'msbuild',
                    'pmd',
                    'prose',
                    'stylish',
                    'tap',
                    'verbose',
                    'vso',
                  ],
                },
                { minLength: 1 },
              ],
            },
            exclude: {
              type: 'array',
              description: 'Files to exclude from linting.',
              default: [],
              items: {
                type: 'string',
              },
            },
            files: {
              type: 'array',
              description: 'Files to include in linting.',
              default: [],
              items: {
                type: 'string',
              },
            },
          },
          additionalProperties: false,
        },
        ngPackagr: {
          description:
            'ng-packagr target options for Build Architect. Use to build library projects.',
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description:
                'The file path for the ng-packagr configuration file, relative to the current workspace.',
            },
            tsConfig: {
              type: 'string',
              description:
                'The full path for the TypeScript configuration file, relative to the current workspace.',
            },
            watch: {
              type: 'boolean',
              description: 'Run build when files change.',
              default: false,
            },
          },
          additionalProperties: false,
        },
      },
    },
    buildersOptions: {
      missingTranslation: {
        type: 'string',
        description: 'How to handle missing translations for i18n.',
        enum: ['warning', 'error', 'ignore'],
        default: 'warning',
      },
      localize: {
        description: 'Translate the bundles in one or more locales.',
        oneOf: [
          {
            type: 'boolean',
            description: 'Translate all locales.',
          },
          {
            type: 'array',
            description: "List of locales ID's to translate.",
            minItems: 1,
            items: {
              type: 'string',
              pattern:
                '^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-[a-zA-Z]{5,8})?(-x(-[a-zA-Z0-9]{1,8})+)?$',
            },
          },
        ],
      },
    },
  },
} as any;

const project = new Project({
  useInMemoryFileSystem: true,
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
    indentationText: IndentationText.TwoSpaces,
  },
});

const generator = new TypescriptInterfaceGenerator(schema, {}, project);

console.log('build interface');

generator
  .build('AngularJson')
  .then(() => {
    const basePath = join(process.cwd(), 'dist');

    if (!directoryExists(basePath)) {
      createDirectory(basePath);
    }

    project.getSourceFiles().forEach((sf) => {
      sf.fixMissingImports();

      const fileName = sf.getBaseName();

      writeFileSync(join(basePath, fileName), sf.getFullText());
    });

    console.log('Done');
  })
  .catch((e) => console.error('failed to generate schema: ' + e.message));
