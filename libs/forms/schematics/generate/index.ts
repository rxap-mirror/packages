import {
  Rule,
  Tree,
  chain,
  noop,
  externalSchematic
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { GenerateSchema } from './schema';
import { XmlParserService } from '@rxap/xml-parser';
import { FormElement } from './elements/form.element';
import {
  Project,
  QuoteKind,
  IndentationText,
  ObjectLiteralExpression
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { formatFiles } from '@nrwl/workspace';
import { Elements } from './elements/elements';
import { readAngularJsonFile } from '@rxap/schematics/utilities';
import { AddDir } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize } = strings;

export function CreateFormComponent({ name, path, project, options }: { name: string, path: string, project: Project, options: GenerateSchema }): Rule {
  return host => {

    const componentFilePath = join(path, dasherize(name) + '-form.component.ts');

    if (!host.exists(componentFilePath)) {
      return chain([
        externalSchematic('@rxap/schematics', 'component-module', {
          path:    path.replace(/^\//, ''),
          name:    dasherize(name) + '-form',
          theme:   false,
          flat:    true,
          project: options.project
        }),
        tree => {

          const content            = tree.read(componentFilePath)!.toString('utf-8');
          const sourceFile         = project.createSourceFile(componentFilePath, content);
          const componentClass     = sourceFile.getClasses()[ 0 ];
          const componentDecorator = componentClass?.getDecorator('Component');
          const componentObject    = componentDecorator?.getArguments()[ 0 ];

          if (componentObject instanceof ObjectLiteralExpression) {
            componentObject.addPropertyAssignment({
              name:        'providers',
              initializer: writer => {
                writer.writeLine('[');
                writer.writeLine('FormProviders,');
                writer.writeLine('FormComponentProviders,');
                writer.write(']');
              }
            });
            sourceFile.addImportDeclaration({
              moduleSpecifier: './form.providers',
              namedImports:    [ 'FormProviders', 'FormComponentProviders' ]
            });
          } else {
            throw new Error('Could not extract the component');
          }

          tree.overwrite(componentFilePath, sourceFile.getFullText());

        }
      ]);
    }

  };
}

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

      if (!options.template) {
        throw new Error('The option template is not defined!');
      }

      const templateFile = host.read(options.template)?.toString('utf-8');

      const parser = new XmlParserService();
      parser.register(...Elements);

      formElement = parser.parseFromXml<FormElement>(templateFile!);

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
      tree => {

        project.getSourceFiles()
               .forEach(sourceFile => {

                 const filePath = join(options.path, sourceFile.getFilePath());

                 if (tree.exists(filePath)) {
                   tree.overwrite(filePath, sourceFile.getFullText());
                 } else {
                   tree.create(filePath, sourceFile.getFullText());
                 }

               });

      },
      options.component ? CreateFormComponent({ name: formElement.id, project, path: options.path, options }) : noop(),
      formatFiles()
    ]);

  };

}
