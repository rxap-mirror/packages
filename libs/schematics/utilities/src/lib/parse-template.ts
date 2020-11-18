import {
  ParsedElement,
  XmlParserService
} from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import {
  Tree,
  DirEntry
} from '@angular-devkit/schematics';
import { join } from 'path';

export function FindTemplate(template: string, host: Tree, baseDirEntry: DirEntry = host.getDir('templates')): string | null {

  if (!host.exists(join(baseDirEntry.path, template))) {
    for (const dirPath of host.getDir(join(baseDirEntry.path, 'features')).subdirs) {
      const templateFilePath = FindTemplate(template, host, host.getDir(join(baseDirEntry.path, 'features', dirPath)));
      if (templateFilePath) {
        return templateFilePath;
      }
    }

    return null;
  }

  return join(baseDirEntry.path, template);

}

export function ParseTemplate<T extends ParsedElement>(host: Tree, template: string, ...elements: Array<Constructor<ParsedElement>>): T {

  let templateFile: string;

  if (template.match(/\.xml$/)) {

    let templateFilePath: string | null = template;
    if (!host.exists(template)) {
      templateFilePath = FindTemplate(template, host);
    }

    if (!templateFilePath) {
      throw new Error(`Could not find template file for '${template}'`);
    } else {
      console.log(`Find template file path '${templateFilePath}' for '${template}'`);
    }

    templateFile = host.read(templateFilePath)!.toString('utf-8');

  } else {
    templateFile = template;
  }

  const parser = new XmlParserService();

  parser.register(...elements);

  return parser.parseFromXml<T>(templateFile!);
}
