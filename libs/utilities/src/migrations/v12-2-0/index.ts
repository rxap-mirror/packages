import {
  Rule,
  Tree,
  FileEntry
} from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';
import {
  Project,
  QuoteKind,
  IndentationText
} from 'ts-morph';

const replaceRxJs: string[]            = [
  'isDefined',
  'isEqual',
  'isDeepEqual',
  'isNotDeepEqual',
  'hasProperty',
  'log',
  'toBoolean',
  'throwIfEmpty',
  'RequestInProgressSubject',
  'ToggleSubject',
  'Node',
  'NodeHasDetailsFunction',
  'NodeGetIconFunction',
  'NodeToDisplayFunction',
  'ExpandNodeFunction',
  'isTeardownLogic',
  'SubscriptionHandlerErrorTypes',
  'SubscriptionHandlerError',
  'SubscriptionHandler',
  'CounterSubject',
  'ButtonTypes',
  'ButtonDefinition',
  'Method',
  'ToMethod'
];
const replaceReflectMetadata: string[] = [
  'hasMetadata',
  'setMetadata',
  'clearMetadata',
  'getMetadata',
  'getOwnMetadata',
  'getMetadataKeys',
  'addToMetadata',
  'mergeWithMetadata',
  'removeFromMetadata',
  'setMetadataMap',
  'setMetadataMapSet',
  'setMetadataMapMap',
  'RxapOnPropertyChange',
  'HasOnChangeMethod',
  'hasOnChangeMethod',
  'PropertyChange',
  'RXAP_DETECT_CHANGES',
  'handler',
  'ProxyChangeDetection',
  'RxapDetectChanges'
];

export default function(): Rule {

  return (host: Tree) => {

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        quoteKind:       QuoteKind.Single,
        indentationText: IndentationText.TwoSpaces
      }
    });

    host.visit((path: Path, entry?: Readonly<FileEntry> | null): void => {

      if (entry && path.match(/\.ts$/) && !path.match(/\/node_modules\//)) {

        const content = entry.content.toString('utf-8');
        const regex   = /from '@rxap\/utilities'/;

        const match = content.match(regex);

        if (match) {
          const sourceFile = project.createSourceFile(path, content);
          let updated      = false;
          sourceFile.getImportDeclarations().forEach(importDeclaration => {
            if (importDeclaration.getModuleSpecifierValue() === '@rxap/utilities') {

              const namedImports = importDeclaration.getNamedImports();
              let changed        = false;
              for (const namedImport of namedImports) {
                if (replaceRxJs.some(name => name === namedImport.getName())) {
                  changed = true;
                  sourceFile.addImportDeclaration({
                    moduleSpecifier: '@rxap/utilities/rxjs',
                    namedImports:    [ namedImport.getName() ]
                  });
                }
                if (replaceReflectMetadata.some(name => name === namedImport.getName())) {
                  changed = true;
                  sourceFile.addImportDeclaration({
                    moduleSpecifier: '@rxap/utilities/reflect-metadata',
                    namedImports:    [ namedImport.getName() ]
                  });
                }
              }
              if (changed) {
                updated               = true;
                const namedImportList = namedImports.filter(namedImport =>
                  !replaceRxJs.some(name => name === namedImport.getName()) &&
                  !replaceReflectMetadata.some(name => name === namedImport.getName())
                ).map(namedImport => namedImport.getName());
                if (namedImportList.length) {
                  importDeclaration.set({
                    moduleSpecifier: '@rxap/utilities',
                    namedImports:    namedImportList
                  });
                } else {
                  sourceFile.removeStatement(importDeclaration.getChildIndex());
                }
              }

            }
          });
          if (updated) {
            host.overwrite(path, sourceFile.getFullText());
          }
        }

      }

    });

  };

}
