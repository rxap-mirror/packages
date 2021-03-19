import {
  Rule,
  Tree,
  chain,
  noop
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { GenerateSchema } from './schema';
import { FormElement } from './elements/form.element';
import {
  Project,
  QuoteKind,
  IndentationText
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { formatFiles } from '@nrwl/workspace';
import { Elements } from './elements/elements';
import { readAngularJsonFile } from '@rxap/schematics/utilities';
import {
  AddDir,
  ApplyTsMorphProject,
  ParseTemplate,
  FixMissingImports
} from '@rxap/schematics-utilities';

const { dasherize, classify, camelize } = strings;

export default function(options: GenerateSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = options.project ? await createDefaultPath(host, options.project as string) : '/';

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    if (!options.openApiModule) {
      const angularJson = readAngularJsonFile(host);
      if (Object.keys(angularJson.projects).includes('open-api')) {
        options.openApiModule = `@${angularJson.projects[ 'open-api' ].prefix}/open-api`;
      } else {
        options.openApiModule = `@${angularJson.projects[ angularJson.defaultProject ].prefix}/open-api`;
      }
    }

    let formElement: FormElement | undefined = options.formElement;

    if (!formElement) {
      formElement = ParseTemplate<FormElement>(host, options.template, options.templateBasePath, ...Elements);
    }

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  { quoteKind: QuoteKind.Single, indentationText: IndentationText.TwoSpaces }
    });

    formElement.id = options.name ? dasherize(options.name) : formElement.id;

    const formFilePath = dasherize(formElement.id) + '.form.ts';

    if (!options.flat) {
      options.path = join(options.path, dasherize(formElement.id) + '-form');
    }

    AddDir(host.getDir(options.path), project, undefined, pathFragment => !!pathFragment.match(/\.ts$/));

    const formSourceFile = project.getSourceFile(formFilePath) ?? project.createSourceFile(formFilePath);

    formElement.toValue({ sourceFile: formSourceFile, project, options });

    project
      .getSourceFiles()
      .forEach(sourceFile => sourceFile.organizeImports());

    return chain([
      ApplyTsMorphProject(project, options.path, options.organizeImports),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop()
    ]);

  };

}
