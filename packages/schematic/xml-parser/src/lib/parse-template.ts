import {
  ParsedElement,
  XmlParserService,
} from '@rxap/xml-parser';
import {
  coerceArray,
  Constructor,
} from '@rxap/schematics-utilities';
import {
  DirEntry,
  Tree,
} from '@angular-devkit/schematics';
import { join } from 'path';

export function FindTemplate(
  template: string,
  host: Tree,
  basePath: string | undefined,
  baseDirEntry: DirEntry = host.getDir('templates'),
): string | null {

  if (basePath) {
    const path = join(baseDirEntry.path, basePath, template);
    if (host.exists(path)) {
      return path;
    } else {
      console.warn(`Could not find template path with a provided basePath: ${ path }`);
    }
  } else {
    const path = join(baseDirEntry.path, template);
    if (host.exists(path)) {
      return path;
    } else {
      console.warn(`Could not find template path without a basePath: ${path}`);
    }
  }

  {
    const path = join(baseDirEntry.path, 'shared', template);
    if (host.exists(path)) {
      return path;
    } else {
      console.warn(`Could not find template path in the shared folder: ${path}`);
    }
  }

  return null;
}

/**
 * Parse the template and returns the ParsedElement object
 *
 * The template parameter can be an xml document or a path to a xml document.
 *
 * The xml document must be in the templates directory.
 *
 * It is possible to provide a relative template path.
 * If the basePath property is not set to undefined then a search in the sub directory is
 * started.
 *
 * Examples
 *
 * Example 1
 *
 * template = 'views/tables/product.xml'
 * basePath = undefined
 *
 * The following path are checked in order:
 * - templates/views/tables/product.xml
 * - templates/shared/views/tables/product.xml
 *
 * Example 2
 *
 * template = 'views/tables/product.xml'
 * basePath = 'feature/product'
 *
 * The following path are checked in order:
 * - templates/feature/product/views/tables/product.xml
 * - templates/shared/views/tables/product.xml
 *
 * @param host a schematic Tree instance
 * @param template the path to the template xml document or a xml document
 * @param basePath the basePath for the search
 * @param elements a collection of ParsedElement class constructors that should be include in the xml parsing
 */
export function ParseTemplate<T extends ParsedElement>(
  host: Tree,
  template: string,
  basePath: string | string[] | undefined,
  ...elements: Array<Constructor<ParsedElement>>
): T {

  let templateFile: string;
  let filename = '__inline__';
  let templateFilePath: string | null = template;
  const basePathList = coerceArray(basePath);

  if (template.match(/\.xml$/)) {

    if (!host.exists(template)) {
      for (const bp of basePathList) {
        templateFilePath = FindTemplate(template, host, bp);
        if (templateFilePath) {
          break;
        }
      }
    }

    if (!templateFilePath) {
      throw new Error(`Could not find template file for '${template}'`);
    } else {
      console.log(`Find template file path '${templateFilePath}' for '${template}'`);
    }

    const filenameMatch = templateFilePath.match(/\/([^/]+)\.xml$/);

    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }

    const templateFileBuffer = host.read(templateFilePath)

    if (!templateFileBuffer) {
      throw new Error(`Could not read the file at path '${templateFilePath}'`);
    }

    templateFile = templateFileBuffer.toString('utf-8');

  } else {
    templateFile = template;
  }

  const parser = new XmlParserService();

  parser.register(...elements);

  if (!templateFile) {
    throw new Error('The template for the xml parser is not defined');
  }

  return parser.parseFromXml<T>(templateFile, filename, templateFilePath);
}
