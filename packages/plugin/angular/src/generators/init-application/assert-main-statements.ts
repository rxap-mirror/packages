import { CoerceImports } from '@rxap/ts-morph';
import { SourceFile } from 'ts-morph';
import { InitApplicationGeneratorSchema } from './schema';

export const MAIN_BOOTSTRAP_STATEMENT = `application.bootstrap().catch((err) => console.error(err));`;
const MAIN_LOGGER_STATEMENT = `application.importProvidersFrom(LoggerModule.forRoot({
  serverLoggingUrl: '/api/logs',
  level: NgxLoggerLevel.DEBUG,
  serverLogLevel: NgxLoggerLevel.ERROR,
}));`;
const MAIN_APP_CREATION_STATEMENT = `const application = new StandaloneApplication(
  environment,
  AppComponent,
  appConfig,
);`;
const REMOTE_MAIN_APP_CREATION_STATEMENT = `const application = new StandaloneApplication(
  environment,
  RemoteEntryComponent,
  appConfig,
);`;

export function assertMainStatements(sourceFile: SourceFile, options: InitApplicationGeneratorSchema) {
  const statements: string[] = [];

  statements.push('const application = new StandaloneApplication(');
  statements.push('application.importProvidersFrom(LoggerModule.forRoot({');
  const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
  for (const statement of statements) {
    if (!existingStatements.includes(statement)) {
      console.error(`Missing statement from angular main.ts:  ${ statement }`);
      sourceFile.set({
        statements: [
          options.moduleFederation === 'remote' ? REMOTE_MAIN_APP_CREATION_STATEMENT : MAIN_APP_CREATION_STATEMENT,
          MAIN_LOGGER_STATEMENT,
          MAIN_BOOTSTRAP_STATEMENT,
        ],
      });
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: './app/app.config',
          namedImports: [ 'appConfig' ],
        },
        {
          moduleSpecifier: './environments/environment',
          namedImports: [ 'environment' ],
        },
        {
          moduleSpecifier: 'ngx-logger',
          namedImports: [ 'LoggerModule', 'NgxLoggerLevel' ],
        },
        {
          moduleSpecifier: '@rxap/ngx-bootstrap',
          namedImports: [ 'StandaloneApplication' ],
        },
      ]);
      if (options.moduleFederation === 'remote') {
        CoerceImports(sourceFile, [
          {
            moduleSpecifier: './app/remote-entry/entry.component',
            namedImports: [ 'RemoteEntryComponent' ],
          },
        ]);
      } else {
        CoerceImports(sourceFile, [
          {
            moduleSpecifier: './app/app.component',
            namedImports: [ 'AppComponent' ],
          },
        ]);
      }
      return;
    }
  }
}
