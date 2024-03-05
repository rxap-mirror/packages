import { Normalized } from '@rxap/utilities';

export type CssClass = string | CssClassOptions | Array<string | CssClassOptions>;

export type NormalizedCssClass = NormalizedCssClassOptions[] | null;

export interface CssClassOptions {
  name: string;
}

export type NormalizedCssClassOptions = Readonly<Normalized<CssClassOptions>>

export function NormalizeCssClass(cssClass?: CssClass | null): NormalizedCssClass {
  let options: CssClassOptions[] = [];
  if (cssClass) {
    if (typeof cssClass === 'string') {
      options = cssClass.split(' ').map(name => (
        { name }
      ));
    } else if (Array.isArray(cssClass)) {
      for (const item of cssClass) {
        const result = NormalizeCssClass(item);
        if (result) {
          options = options.concat(result);
        }
      }
    } else if (typeof cssClass === 'object') {
      options = [ cssClass ];
    }
  }
  if (options.length === 0) {
    return null;
  }
  return options.map(option => Object.freeze(option));
}
