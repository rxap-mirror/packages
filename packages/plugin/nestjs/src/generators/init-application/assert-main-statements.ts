import { CoerceImports } from '@rxap/ts-morph';
import { SourceFile } from 'ts-morph';

const MAIN_BOOTSTRAP_OPTIONS_STATEMENT = 'const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {};';
const MAIN_SERVER_STATEMENT = 'const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(AppModule, environment, options, bootstrapOptions);';
export const MAIN_BOOTSTRAP_STATEMENT = 'server.bootstrap().catch((e) => console.error(\'Server bootstrap failed: \' + e.message));';
const MAIN_SETUP_HELMET_STATEMENT = 'server.after(SetupHelmet());';
const MAIN_SETUP_COOKIE_STATEMENT = 'server.after(SetupCookieParser());';
const MAIN_SETUP_CORS_STATEMENT = 'server.after(SetupCors());';
const MAIN_NEST_APP_OPTIONS_STATEMENT = 'const options: NestApplicationOptions = {};';

export function assertMainStatements(sourceFile: SourceFile) {
  const statements: string[] = [];

  statements.push('const options: NestApplicationOptions = {');
  statements.push('const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {');
  statements.push(
    'const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(AppModule, environment, options, bootstrapOptions);');

  const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
  for (const statement of statements) {
    if (!existingStatements.includes(statement)) {
      console.error(`Missing statement from nestjs main.ts:  ${ statement }`);
      sourceFile.set({
        statements: [
          MAIN_NEST_APP_OPTIONS_STATEMENT,
          MAIN_BOOTSTRAP_OPTIONS_STATEMENT,
          MAIN_SERVER_STATEMENT,
          MAIN_SETUP_HELMET_STATEMENT,
          MAIN_SETUP_COOKIE_STATEMENT,
          MAIN_SETUP_CORS_STATEMENT,
          MAIN_BOOTSTRAP_STATEMENT,
        ],
      });
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@nestjs/common',
          namedImports: [ 'NestApplicationOptions' ],
        },
        {
          moduleSpecifier: '@nestjs/platform-express',
          namedImports: [ 'NestExpressApplication' ],
        },
        {
          moduleSpecifier: '@rxap/nest-server',
          namedImports: [
            'MonolithicBootstrapOptions',
            'Monolithic',
            'SetupHelmet',
            'SetupCookieParser',
            'SetupCors',
          ],
        },
        {
          moduleSpecifier: './app/app.module',
          namedImports: [ 'AppModule' ],
        },
        {
          moduleSpecifier: './environments/environment',
          namedImports: [ 'environment' ],
        },
      ]);
      return;
    }
  }


}
