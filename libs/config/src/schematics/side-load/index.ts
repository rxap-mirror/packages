import {
  Rule,
  Tree,
  chain
} from '@angular-devkit/schematics';
import { SideLoadSchema } from './schema';
import {
  Project,
  IndentationText
} from 'ts-morph';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import {
  ApplyTsMorphProject,
  AddToArray
} from '@rxap/schematics-ts-morph';
import { join } from 'path';

export default function(options: SideLoadSchema): Rule {

  return async (host: Tree) => {

    const project = new Project({
      manipulationSettings:  {
        indentationText: IndentationText.TwoSpaces
      },
      useInMemoryFileSystem: true
    });

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    const mainSourceFile = project.createSourceFile(
      'main.ts',
      host.read(join(projectSourceRoot, 'main.ts')
      )!.toString('utf-8')
    );

    AddToArray(
      mainSourceFile,
      'configSideLoad',
      `ConfigService.SideLoad('${options.url}', '${options.propertyPath}', ${options.required ?? false})`,
      'Promise<any>[]'
    );

    return chain([
      ApplyTsMorphProject(project, projectSourceRoot)
    ]);

  };

}
