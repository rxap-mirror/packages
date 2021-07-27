import {
  Rule,
  Tree,
  chain,
  noop,
  SchematicsException,
  externalSchematic
} from '@angular-devkit/schematics';
import { InitSchema } from './schema';
import {
  AddPackageJsonDependency,
  GetProjectSourceRoot,
  CoerceFile,
  UpdateJsonFile,
  UpdateAngularProject,
  InstallNodePackages,
  AddPackageJsonScript
} from '@rxap/schematics-utilities';
import {
  Project,
  IndentationText
} from 'ts-morph';
import {
  ApplyTsMorphProject,
  AddNgModuleImport,
  AddNgModuleProvider,
  AddToArray
} from '@rxap/schematics-ts-morph';
import { join } from 'path';

export interface UpdateIgnoreFileOptions {
  filePath?: string
}

export function UpdateIgnoreFile(ignore: string[], options: UpdateIgnoreFileOptions = {}): Rule {
  return tree => {
    const filePath = options.filePath ?? '.gitignore';
    CoerceFile(tree, filePath, '');
    let content = tree.read(filePath)!.toString('utf-8');
    for (const entry of ignore) {
      if (!content.match(new RegExp(`^${entry}$`))) {
        content += `\n${entry}`;
      }
    }
    tree.overwrite(filePath, content);
  };
}

export default function(options: InitSchema): Rule {

  return async (host: Tree) => {

    const project = new Project({
      manipulationSettings:  {
        indentationText: IndentationText.TwoSpaces
      },
      useInMemoryFileSystem: true
    });

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    const appModuleSourceFile = project.createSourceFile(
      'app/app.module.ts',
      host.read(join(projectSourceRoot, 'app/app.module.ts')
      )!.toString('utf-8')
    );

    const mainSourceFile = project.createSourceFile(
      'main.ts',
      host.read(join(projectSourceRoot, 'main.ts')
      )!.toString('utf-8')
    );

    AddToArray(
      mainSourceFile,
      'configSideLoad',
      `ConfigService
      .SideLoad('/config.firebase.options.json', 'firebase.options', true)
      .catch(async () => {
        if (!ConfigService.Config.firebase || !ConfigService.Config.firebase.options || !ConfigService.Config.firebase.options.apiKey) {
          try {
            const response = await fetch('/__/firebase/init.json');
            SetObjectValue(ConfigService.Config, 'firebase.options', await response.json());
          } catch (e) {
            throw new Error(\`Could not load the firebase: \${e.message}\`);
          }
        }
      }),`,
      'Promise<any>[]'
    );
    mainSourceFile.addImportDeclaration({
      namedImports:    [ 'SetObjectValue' ],
      moduleSpecifier: '@rxap/utilities'
    });

    if (options.functions) {
      AddNgModuleImport(
        appModuleSourceFile,
        'AngularFireFunctionsModule',
        '@angular/fire/functions'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_FUNCTIONS_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_FUNCTIONS_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    if (options.analytics) {
      AddNgModuleImport(
        appModuleSourceFile,
        'AngularFireAnalyticsModule',
        '@angular/fire/analytics'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_ANALYTICS_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_ANALYTICS_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'ScreenTrackingService',
        [
          {
            namedImports:    [ 'ScreenTrackingService' ],
            moduleSpecifier: '@angular/fire/analytics'
          }
        ]
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'UserTrackingService',
        [
          {
            namedImports:    [ 'UserTrackingService' ],
            moduleSpecifier: '@angular/fire/analytics'
          }
        ]
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        {
          provide:  'ANALYTICS_APP_VERSION',
          useValue: 'environment.release'
        },
        [
          {
            namedImports:    [
              {
                name:  'APP_VERSION',
                alias: 'ANALYTICS_APP_VERSION'
              }
            ],
            moduleSpecifier: '@angular/fire/analytics'
          },
          {
            namedImports:    [ 'environment' ],
            moduleSpecifier: '../environments/environment'
          }
        ]
      );
    }

    if (options.performance) {
      AddNgModuleImport(
        appModuleSourceFile,
        'AngularFirePerformanceModule',
        '@angular/fire/performance'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'PerformanceMonitoringService',
        [
          {
            namedImports:    [ 'PerformanceMonitoringService' ],
            moduleSpecifier: '@angular/fire/performance'
          }
        ]
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_PERFORMANCE_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_PERFORMANCE_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    if (options.storage) {
      AddNgModuleImport(
        appModuleSourceFile,
        'RxapAngularFireStorageModule',
        '@rxap/firebase'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_STORAGE_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_STORAGE_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    if (options.appCheck) {
      AddNgModuleImport(
        appModuleSourceFile,
        'RxapAngularFireAppCheckModule',
        '@rxap/firebase'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_APP_CHECK_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_APP_CHECK_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    if (options.firestore) {
      AddNgModuleImport(
        appModuleSourceFile,
        'AngularFirestoreModule',
        '@angular/fire/firestore'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_FIRESTORE_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_FIRESTORE_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    if (options.auth) {
      AddNgModuleImport(
        appModuleSourceFile,
        'AngularFireAuthModule',
        '@angular/fire/auth'
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        {
          provide:  'RxapAuthenticationService',
          useClass: 'IdentityPlatformService'
        },
        [
          {
            namedImports:    [ 'IdentityPlatformService' ],
            moduleSpecifier: '@rxap/firebase/auth'
          },
          {
            namedImports:    [ 'RxapAuthenticationService' ],
            moduleSpecifier: '@rxap/authentication'
          }
        ]
      );
      AddNgModuleProvider(
        appModuleSourceFile,
        'FIREBASE_AUTH_PROVIDERS',
        [
          {
            namedImports:    [ 'FIREBASE_AUTH_PROVIDERS' ],
            moduleSpecifier: '@rxap/firebase'
          }
        ]
      );
    }

    return chain([
      ApplyTsMorphProject(project, projectSourceRoot),
      AddPackageJsonDependency('first-input-delay'),
      AddPackageJsonScript('emulators:start', 'firebase emulators:start --export-on-exit=\".firebase-emulator\" --import=\".firebase-emulator\"'),
      tree => CoerceFile(
        tree,
        join(projectSourceRoot, 'config.firebase.options.json'),
        JSON.stringify(
          {},
          undefined,
          2
        )
      ),
      options.auth ? AddPackageJsonDependency('@rxap/authentication') : noop(),
      options.functions ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.functions.json'),
          JSON.stringify(
            {
              region: 'europe-west3'
            },
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.functions.json',
            propertyPath: 'firebase.functions',
            required:     true
          }
        )
      ]) : noop(),
      options.analytics ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.analytics.json'),
          JSON.stringify(
            {
              enabled: false
            },
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.analytics.json',
            propertyPath: 'firebase.analytics'
          }
        )
      ]) : noop(),
      options.performance ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.performance.json'),
          JSON.stringify(
            {
              instrumentationEnabled: false,
              dataCollectionEnabled:  false
            },
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.performance.json',
            propertyPath: 'firebase.performance'
          }
        )
      ]) : noop(),
      options.storage ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.storage.json'),
          JSON.stringify(
            {},
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.storage.json',
            propertyPath: 'firebase.storage'
          }
        )
      ]) : noop(),
      options.appCheck ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.appcheck.json'),
          JSON.stringify(
            {
              siteKey: '',
              enabled: false
            },
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.appcheck.json',
            propertyPath: 'firebase.appCheck',
            required:     true
          }
        )
      ]) : noop(),
      options.firestore ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.firestore.json'),
          JSON.stringify(
            {},
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.firestore.json',
            propertyPath: 'firebase.firestore'
          }
        )
      ]) : noop(),
      options.auth ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.auth.json'),
          JSON.stringify(
            {},
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.auth.json',
            propertyPath: 'firebase.auth'
          }
        )
      ]) : noop(),
      options.useEmulator ? chain([
        tree => CoerceFile(
          tree,
          join(projectSourceRoot, 'config.firebase.emulator.json'),
          JSON.stringify(
            Object.assign(
              {},
              options.functions ? {
                auth: [ 'localhost', 5501 ]
              } : {},
              options.storage ? {
                auth: [ 'localhost', 9199 ]
              } : {},
              options.firestore ? {
                auth: [ 'localhost', 8888 ]
              } : {},
              options.auth ? {
                auth: [ 'localhost', 9099 ]
              } : {}
            ),
            undefined,
            2
          )
        ),
        externalSchematic(
          '@rxap/config',
          'side-load',
          {
            project:      options.project,
            url:          '/config.firebase.emulator.json',
            propertyPath: 'firebase.emulator'
          }
        )
      ]) : noop(),
      tree => {
        let content = tree.read(join(projectSourceRoot, 'polyfills.ts'))!.toString('utf-8');
        if (options.appCheck) {
          if (!content.includes(`import 'firebase/app-check';`)) {
            content = `import 'firebase/app-check';\n\n` + content;
          }
        }
        if (options.performance) {
          if (!content.includes(`import 'first-input-delay';`)) {
            content = `import 'first-input-delay';\n\n` + content;
          }
        }
        tree.overwrite(join(projectSourceRoot, 'polyfills.ts'), content);
      },
      UpdateAngularProject(angularProject => {
        if (!angularProject.targets.has('build')) {
          throw new SchematicsException('The project does not have a build target');
        }
        const buildTarget = angularProject.targets.get('build')!;
        if (!buildTarget.options.assets) {
          buildTarget.options.assets = [];
        }
        const assets: string[] = [];
        if (options.functions) {
          assets.push(join(projectSourceRoot, 'config.firebase.functions.json'));
        }
        if (options.analytics) {
          assets.push(join(projectSourceRoot, 'config.firebase.analytics.json'));
        }
        if (options.performance) {
          assets.push(join(projectSourceRoot, 'config.firebase.performance.json'));
        }
        if (options.storage) {
          assets.push(join(projectSourceRoot, 'config.firebase.storage.json'));
        }
        if (options.appCheck) {
          assets.push(join(projectSourceRoot, 'config.firebase.appcheck.json'));
        }
        if (options.firestore) {
          assets.push(join(projectSourceRoot, 'config.firebase.firestore.json'));
        }
        if (options.auth) {
          assets.push(join(projectSourceRoot, 'config.firebase.auth.json'));
        }
        if (options.useEmulator) {
          assets.push(join(projectSourceRoot, 'config.firebase.emulator.json'));
        }
        for (const asset of assets) {
          if (!buildTarget.options.assets.includes(asset)) {
            buildTarget.options.assets.push(asset);
          }
        }
      }, { projectName: options.project }),
      UpdateJsonFile(jsonFile => {
        if (options.useEmulator) {
          if (!jsonFile.emulators) {
            jsonFile.emulators = {};
          }
          if (options.functions) {
            jsonFile.emulators.functions = { port: 5501 };
          }
          if (options.storage) {
            jsonFile.emulators.storage = { port: 9199 };
          }
          if (options.firestore) {
            jsonFile.emulators.firestore = { port: 8888 };
          }
          if (options.auth) {
            jsonFile.emulators.auth = { port: 9099 };
          }
          jsonFile.emulators.hosting = { port: 5000 };
          jsonFile.emulators.ui      = { enabled: true };
        }
        if (options.storage) {
          if (!jsonFile.storage) {
            jsonFile.storage = {};
          }
          jsonFile.storage.rules = 'storage.rules';
        }
        if (options.firestore) {
          if (!jsonFile.firestore) {
            jsonFile.firestore = {};
          }
          jsonFile.firestore.rules   = 'firestore.rules';
          jsonFile.firestore.indexes = 'firestore.indexes.json';
        }
        if (options.hostingSite) {
          jsonFile.hosting = {
            site:     options.hostingSite,
            public:   'dist/apps/pwa',
            ignore:   [
              '**/.*'
            ],
            headers:  [
              {
                'source':  '*.[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].+(css|js)',
                'headers': [
                  {
                    'key':   'Cache-Control',
                    'value': 'public,max-age=31536000,immutable'
                  }
                ]
              },
              {
                'source':  '**/*.@(json)',
                'headers': [
                  {
                    'key':   'Cache-Control',
                    'value': 'public,max-age=60'
                  }
                ]
              }
            ],
            rewrites: [
              {
                'source':      '**',
                'destination': '/index.html'
              }
            ]
          };
        }
        if (options.functions) {
          jsonFile.functions = {
            source: 'dist/apps/functions'
          };
        }
      }, 'firebase.json', { create: true }),
      options.storage ? tree => CoerceFile(
        tree,
        'storage.rules',
        `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`
      ) : noop(),
      options.firestore ? tree => CoerceFile(
        tree,
        'firestore.indexes.json',
        JSON.stringify({
          indexes:        [],
          fieldOverrides: []
        }, undefined, 2)
      ) : noop(),
      options.firestore ? tree => CoerceFile(
        tree,
        'firestore.rules',
        `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`
      ) : noop(),
      UpdateIgnoreFile([
        '.firebase-emulator',
        '.runtimeconfig.json'
      ]),
      UpdateIgnoreFile([
        'config.*.json'
      ], { filePath: join(projectSourceRoot, '.gitignore') }),
      InstallNodePackages()
    ]);

  };

}
