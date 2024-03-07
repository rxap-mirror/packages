import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';

export type CssClass = string | CssClassOptions | Array<string | CssClassOptions>;

export function CoerceCssClass(cssClass: CssClass | null | undefined, addCssClass: string | CssClassOptions): CssClass {
  cssClass ??= [];

  if (typeof cssClass === 'string') {
    cssClass = cssClass.split(' ');
  }

  if (typeof cssClass === 'object' && !Array.isArray(cssClass)) {
    cssClass = [ cssClass ];
  }

  if (!Array.isArray(cssClass)) {
    throw new Error('FATAL ERROR: this state should not be possible');
  } else {
    cssClass = cssClass.map(item => {
      if (typeof item === 'string') {
        return { name: item };
      }
      return item;
    });
    CoerceArrayItems(
      cssClass as CssClassOptions[], [ typeof addCssClass === 'string' ? { name: addCssClass } : addCssClass ],
      (a, b) => a.name === b.name,
    );
  }
  return cssClass;
}

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
