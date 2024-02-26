import {
  existsSync,
  readFileSync,
} from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';

export function LoadHandlebarsTemplate(
  template: string,
  basePath: string
): Handlebars.TemplateDelegate {
  let fullPath = template;
  if (!fullPath.startsWith('/')) {
    fullPath = join(basePath, template);
  }
  if (!existsSync(fullPath)) {
    throw new Error(`The template file "${ fullPath }" does not exists`);
  }
  const content = readFileSync(fullPath, 'utf-8');
  return Handlebars.compile(content);
}

export function LoadMatFormFieldHandlebarsTemplate(
  template = 'mat-form-field.hbs'
): Handlebars.TemplateDelegate {
  return LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'form', 'templates'));
}

export function LoadPipeHandlebarsTemplate(
  template = 'pipe.hbs'
): Handlebars.TemplateDelegate {
  return LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'templates'));
}
