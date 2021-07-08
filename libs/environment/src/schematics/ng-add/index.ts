import {
  Rule,
  chain,
  Tree,
  SchematicsException
} from '@angular-devkit/schematics';
import {
  InstallPeerDependencies,
  GetProjectSourceRoot
} from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';
import {
  Project,
  QuoteKind,
  IndentationText
} from 'ts-morph';
import {
  AddDir,
  ApplyTsMorphProject,
  AddNgModuleProvider,
  AddToArray
} from '@rxap/schematics-ts-morph';

export default function(options: NgAddSchema): Rule {
  return (host: Tree) => {

    const rules: Rule[] = [
      InstallPeerDependencies()
    ];

    if (options.project) {
      const projectSourceRoot = GetProjectSourceRoot(host, options.project);
      const project           = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings:  { quoteKind: QuoteKind.Single, indentationText: IndentationText.TwoSpaces }
      });
      AddDir(host.getDir(projectSourceRoot), project);

      const appModelSourceFile = project.getSourceFile('/app/app.module.ts');

      if (!appModelSourceFile) {
        throw new SchematicsException(`Could not find the AppModule source file in '[projectSourceRoot]/app/app.module.ts'`);
      }

      AddNgModuleProvider(
        appModelSourceFile,
        {
          provide:  'RXAP_ENVIRONMENT',
          useValue: 'environment'
        },
        [
          {
            namedImports:    [ 'RXAP_ENVIRONMENT' ],
            moduleSpecifier: '@rxap/environment'
          },
          {
            namedImports:    [ 'environment' ],
            moduleSpecifier: '../environments/environment'
          }
        ]
      );

      const mainSourceFile = project.getSourceFile('/main.ts');

      if (!mainSourceFile) {
        throw new SchematicsException(`Could not find the main.ts source file in '[projectSourceRoot]/main.ts'`);
      }

      AddToArray(
        mainSourceFile,
        'setup',
        'UpdateEnvironment(environment)',
        'Promise<any>[]'
      );

      mainSourceFile.addImportDeclarations([
        {
          namedImports:    [ 'UpdateEnvironment' ],
          moduleSpecifier: '@rxap/environment'
        },
        {
          namedImports:    [ 'environment' ],
          moduleSpecifier: './environments/environment'
        }
      ]);

      rules.push(ApplyTsMorphProject(project, projectSourceRoot));
    }

    return chain(rules);

  };
}
