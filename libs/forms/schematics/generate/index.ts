import {
  Rule,
  Tree,
  chain,
  DirEntry,
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
  ObjectLiteralExpression,
  Writers
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { formatFiles } from '@nrwl/workspace';
import { Elements } from './elements/elements';
import { readAngularJsonFile } from '@rxap/schematics/utilities';

const { dasherize, classify, camelize } = strings;

function AddDir(dir: DirEntry, project: Project, parentPath: string = '', filter: ((pathFragment: string) => boolean) = () => true) {
  for (const pathFragment of dir.subfiles.filter(filter)) {
    const fileEntry = dir.file(pathFragment);
    if (fileEntry) {
      project.createSourceFile(join(parentPath, pathFragment), fileEntry.content.toString('utf-8'));
    } else {
      throw new Error('The path fragment does not point to a file entry');
    }
  }
  for (const pathFragment of dir.subdirs) {
    const dirEntry = dir.dir(pathFragment);
    if (dirEntry) {
      AddDir(dirEntry, project, join(parentPath, pathFragment), filter);
    } else {
      throw new Error('The path fragment does not point to a dir entry');
    }
  }
}

export function CreateFormComponent({ name, path, project }: { name: string, path: string, project: Project }): Rule {
  return host => {

    const componentFilePath = join(path, dasherize(name) + '-form.component.ts');

    if (!host.exists(componentFilePath)) {
      return chain([
        externalSchematic('@rxap/schematics', 'component-module', {
          path:  path.replace(/^\//, ''),
          name:  dasherize(name) + '-form',
          theme: false,
          flat:  true
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

    options.path = join(options.path, dasherize(formElement.id) + '-form');

    AddDir(host.getDir(options.path), project, undefined, pathFragment => !!pathFragment.match(/\.ts$/));

    const formSourceFile = project.getSourceFile(formFilePath) ?? project.createSourceFile(formFilePath);

    formElement.toValue({ sourceFile: formSourceFile, project, options });

    project.getSourceFiles()
           .forEach(sourceFile => {

             sourceFile.organizeImports();

             // console.log('==========================================')
             // console.log('==========================================')
             // console.log(sourceFile.getFilePath());
             // console.log('==========================================')
             // console.log(sourceFile.getFullText());

           });

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
      options.component ? CreateFormComponent({ name: formElement.id, project, path: options.path }) : noop(),
      formatFiles()
    ]);

  };

}
