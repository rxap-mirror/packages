import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceImports } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { Statement } from 'ts-morph';
import {
  assertMainStatements,
  MAIN_BOOTSTRAP_STATEMENT,
} from './assert-main-statements';
import { InitApplicationGeneratorSchema } from './schema';

export function updateMainFile(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  TsMorphAngularProjectTransform(tree, {
    project: projectName,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile, mainSourceFile ]) => {

    assertMainStatements(sourceFile, options);

    const importDeclarations = [];
    const statements: string[] = [];

    if (options.serviceWorker) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/service-worker',
        namedImports: [ 'UnregisterServiceWorker' ],
      });
      statements.push('application.before(() => UnregisterServiceWorker(environment));');
    }

    if (options.openApi) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/open-api',
        namedImports: [ 'OpenApiInit' ],
      });
      if (options.openApiLegacy) {
        statements.push('application.before(() => OpenApiInit(environment, { load: true }));');
      } else {
        statements.push('application.before(() => OpenApiInit(environment));');
      }
    }

    if (options.sentry) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/ngx-sentry',
        namedImports: [ 'SentryInit' ],
      });
      statements.push('application.before(() => SentryInit(environment));');
    }

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const nestStatement = i < statements.length - 1 ? statements[i + 1] : null;
      const existingStatements: string[] = sourceFile.getStatements().map((s: Statement) => s.getText()) ?? [];
      if (!existingStatements.includes(statement)) {
        let index: number;
        if (lastStatement) {
          index = existingStatements.findIndex(s => s.includes(lastStatement)) + 1;
        } else if (nestStatement) {
          index = existingStatements.findIndex(s => s.includes(nestStatement));
        } else {
          index = existingStatements.findIndex(s => s.includes(MAIN_BOOTSTRAP_STATEMENT));
        }
        console.log(`insert statement: ${ statement } at index ${ index }`);
        sourceFile.insertStatements(index, statement);
      }
    }

    if (options.moduleFederation === 'host') {
      mainSourceFile.set({
        statements: [
          `import {
  setRemoteDefinitions,
  setRemoteUrlResolver
} from '@nx/angular/mf';
import type { Environment } from '@rxap/environment';
import { environment } from './environments/environment';

export async function SetupDynamicMfe(environment: Environment) {

  const manifest = environment.moduleFederation?.manifest;

  if (!manifest) {
    const release = environment.tag || environment.branch || 'latest';
    setRemoteUrlResolver((remoteName: string) => \`\${ location.origin }/__mfe/\${ release }/\${ remoteName }\`);
  } else {

    let definitions: Record<string, string>;

    if (typeof manifest === 'object') {
      definitions = manifest;
    } else {
      definitions = await fetch(manifest).then((res) => res.json());
    }

    setRemoteDefinitions(definitions);

  }

}

SetupDynamicMfe(environment).then(() => import('./bootstrap').catch((err) => console.error(err)));
`,
        ],
      });
    }

  }, [
    options.moduleFederation ? 'bootstrap.ts' : 'main.ts',
    'main.ts',
  ]);
}
