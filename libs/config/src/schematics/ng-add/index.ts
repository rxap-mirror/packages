import {
  Rule,
  Tree,
  chain,
  SchematicsException
} from '@angular-devkit/schematics';
import {
  InstallPeerDependencies,
  GetProjectSourceRoot,
  UpdateAngularJson
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
  AddToArray
} from '@rxap/schematics-ts-morph';
import { join } from 'path';

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

      const mainSourceFile = project.getSourceFile('/main.ts');

      if (!mainSourceFile) {
        throw new SchematicsException(`Could not find the main.ts source file in '[projectSourceRoot]/main.ts'`);
      }

      AddToArray(
        mainSourceFile,
        'configSideLoad',
        'Promise.resolve()',
        'Promise<any>[]'
      );

      AddToArray(
        mainSourceFile,
        'setup',
        'ConfigService.Load().then(() => Promise.all(configSideLoad))',
        'Promise<any>[]'
      );

      mainSourceFile.addImportDeclarations([
        {
          namedImports:    [ 'ConfigService' ],
          moduleSpecifier: '@rxap/config'
        }
      ]);

      rules.push(ApplyTsMorphProject(project, projectSourceRoot));

      const configFilePath = join(projectSourceRoot, 'config.json');

      rules.push(UpdateAngularJson(angular => {

        const p = angular.projects.get(options.project!);

        if (p) {
          const buildTarget = p.targets.get('build');
          if (buildTarget) {
            if (!buildTarget.options.assets) {
              buildTarget.options.assets = [];
            }
            const assets: string[] = buildTarget.options.assets;
            if (!assets.includes(configFilePath)) {
              assets.push(configFilePath);
            }
          }
        }

      }));

      rules.push(tree => {
        if (!tree.exists(configFilePath)) {
          tree.create(configFilePath, '{}');
        }
      });

    }

    return chain(rules);

  };
}
