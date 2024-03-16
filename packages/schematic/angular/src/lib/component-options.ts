import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  Normalized,
} from '@rxap/utilities';

export interface ComponentOptions extends TypeImport {
  selector?: string | false;
}

export interface NormalizedComponentOptions extends Readonly<Normalized<Omit<ComponentOptions, keyof TypeImport>> & NormalizedTypeImport> {
  selector: string | false;
  namedImport: string;
}

export function NormalizeComponentOptions(options: ComponentOptions): NormalizedComponentOptions {
  const name = dasherize(options.name).replace(/-component$/, '');
  const namedImport = classify(name + '-component');
  return {
    ...NormalizeTypeImport({
      ...options,
      name,
      namedImport,
    }),
    namedImport,
    selector: options.selector ?? false,
  };
}
