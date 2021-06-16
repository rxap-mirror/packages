import { Rule, Tree, FileEntry } from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';
import {
  Project,
  IndentationText,
  QuoteKind,
  OptionalKind,
  InterfaceDeclarationStructure,
} from 'ts-morph';

export function CreateEmptyInterface(
  content: string,
  className: string
): string {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useInMemoryFileSystem: true,
  });
  const sourceFile = project.createSourceFile('file.ts', content);
  const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
    name: `I${className}`,
    isExported: true,
  };
  sourceFile.insertInterface(
    (sourceFile
      .getImportDeclarations()
      .map((id) => id.getChildIndex())
      .sort()
      .reverse()[0] ?? -1) + 1,
    interfaceStructure
  );
  return sourceFile.getFullText();
}

export function AddMissingType(content: string): string | null {
  const regex = /new RxapFormBuilder\(([^,\)]+)/;
  let match = content.match(regex);

  if (match) {
    while ((match = content.match(regex))) {
      const formClass = match[1].trim();
      if (!content.includes(`I${formClass}`)) {
        content = CreateEmptyInterface(content, formClass);
      }
      content = content.replace(regex, 'new RxapFormBuilder<I$1>($1');
    }
    return content;
  }
  return null;
}

export function UpdateType(content: string): string | null {
  const regex = /RxapFormBuilder<([^I][^>]+)>/;
  let match = content.match(regex);

  if (match) {
    while ((match = content.match(regex))) {
      const formClass = match[1].trim();
      if (!content.includes(`I${formClass}`)) {
        content = CreateEmptyInterface(content, formClass);
      }
      content = content.replace(regex, 'RxapFormBuilder<I$1>');
    }
    return content;
  }
  return null;
}

export default function (): Rule {
  return (host: Tree) => {
    host.visit((path: Path, entry?: Readonly<FileEntry> | null): void => {
      if (entry && path.match(/\.ts$/) && !path.match(/\/node_modules\//)) {
        let originalContent: string;
        let content = (originalContent = entry.content.toString('utf-8'));
        content = AddMissingType(content) ?? content;
        content = UpdateType(content) ?? content;
        if (originalContent !== content) {
          host.overwrite(path, content);
        }
      }
    });
  };
}
