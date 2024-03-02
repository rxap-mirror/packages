import { NormalizedControl } from './control';

export interface GenerateFormTemplateOptions {
  controlList: ReadonlyArray<NormalizedControl>;
}

export function GenerateFormTemplate(options: GenerateFormTemplateOptions): string {
  let content = '';
  for (const control of options.controlList) {
    content += control.handlebars({ control });
  }
  return content;
}
