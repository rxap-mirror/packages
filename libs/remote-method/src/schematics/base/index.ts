import {
  Rule,
  Tree,
  chain,
  schematic,
  noop
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import {
  join,
  relative
} from 'path';
import { BaseSchema } from './schema';
import {
  Project,
  QuoteKind,
  IndentationText,
  SourceFile,
  Writers,
  Scope
} from 'ts-morph';

import { strings } from '@angular-devkit/core';

const { classify, camelize, dasherize } = strings;

export interface CreateRemoteMethodOptions {
  filePath: string;
  name: string;
  parametersType: string;
  returnType: string;
  collection: boolean;
}

export function CreateRemoteMethod({ filePath, name, parametersType, returnType, collection }: CreateRemoteMethodOptions): Rule {
  return tree => {

    if (tree.exists(filePath)) {
      console.warn(`The file '${filePath}' already exists!`);
      return;
    }

    const project = new Project({
      manipulationSettings:  { quoteKind: QuoteKind.Single, indentationText: IndentationText.TwoSpaces, useTrailingCommas: true },
      useInMemoryFileSystem: true
    });

    const sourceFile: SourceFile = project.createSourceFile(filePath);

    const remoteMethodName = classify([ name, 'remote-method' ].join('-'));

    sourceFile.addClass({
      name: remoteMethodName,
      decorators: [
        {
          name: 'RxapRemoteMethod',
          arguments: [Writers.object({
            id: writer => writer.quote(dasherize(name))
          })]
        },
        {
          name: 'Injectable',
          arguments: [],
        }
      ],
      isExported: true,
      extends:    `BaseRemoteMethod<${returnType}${collection ? '[]' : ''}, ${parametersType}>`,
      methods: [
        {
          name: '_call',
          isAsync: true,
          parameters: [
            {
              name: 'parameters',
              hasQuestionToken: true,
              type: parametersType
            }
          ],
          scope: Scope.Protected,
          returnType: `Promise<${returnType}${collection ? '[]' : ''}>`,
          statements: [
            `return Promise.reject('Not yet implemented')`,
          ]
        }
      ]
    });

    sourceFile.addImportDeclarations([
      {
        namedImports: [{ name: 'Injectable' }],
        moduleSpecifier: '@angular/core'
      },
      {
        moduleSpecifier: '@rxap/remote-method',
        namedImports: [
          { name: 'RxapRemoteMethod' },
          { name: 'BaseRemoteMethod' }
        ]
      }
    ]);

    tree.create(filePath, sourceFile.getFullText());

  }
}

export function AddExport(basePath: string, filePath: string): Rule {
  return tree => {

    const indexFilePath = join(basePath, 'index.ts');

    if (!tree.exists(indexFilePath)) {
      console.warn('Could not find index file!');
      return;
    }

    const relPath = relative(basePath.replace(/^\//, ''), filePath.replace(/^\//, ''));

    let indexFile = tree.get(indexFilePath)!.content.toString('utf-8');

    indexFile += `\nexport * from './${relPath.replace(/\.ts$/, '')}';`;

    tree.overwrite(indexFilePath, indexFile);

  }
}

export default function(options: BaseSchema): Rule {

  return async (host: Tree) => {

    const projectBasePath = await createDefaultPath(host, options.project as string);
    let path = projectBasePath;

    if (options.path) {
      if (options.path[ 0 ] === '/') {
        path = join(path, options.path);
      } else {
        path = options.path;
      }
    }

    const filePath = join(path, [ dasherize(options.name), 'remote-method', 'ts' ].join('.'));

    return chain([
      CreateRemoteMethod({
        filePath,
        name: options.name,
        collection: options.collection,
        returnType: options.returnType,
        parametersType: options.parametersType,
      }),
      schematic('directive', options),
      options.export ? AddExport(join(projectBasePath, '..'), filePath) : noop(),
    ]);

  };

}
