import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';

export interface ValueOption {
  value: string;
  type?: string | TypeImport;
}

export interface NormalizedValueOption {
  value: string;
  templateValue: string;
  type: NormalizedTypeImport;
}

function guessType(value: any): TypeImport {
  if (typeof value === 'string') {
    return {
      name: 'string',
    };
  }
  if (typeof value === 'number') {
    return {
      name: 'number',
    };
  }
  if (typeof value === 'boolean') {
    return {
      name: 'boolean',
    };
  }
  if (!isNaN(Number(value))) {
    return {
      name: 'number',
    };
  }
  if (['true', 'false'].includes(value)) {
    return {
      name: 'boolean',
    };
  }
  return {
    name: 'unknown',
  };
}

export function NormalizeValueOption(option: Readonly<ValueOption> | string): Readonly<NormalizedValueOption> {
  let type: NormalizedTypeImport;
  let value: string;
  if (typeof option === 'string') {
    if ((option.startsWith('\'') && option.endsWith('\'')) || (option.startsWith('`') && option.endsWith('`')) || (option.startsWith('"') && option.endsWith('"'))) {
      type = NormalizeTypeImport({
        name: 'string',
      });
      value = option.replace(/^['"`]/, '').replace(/['"`]$/, '');
    } else {
      type = NormalizeTypeImport(guessType(option));
      value = option;
    }
  } else {
    type = NormalizeTypeImport(option.type);
    value = option.value;
  }
  return Object.freeze({
    value,
    type,
    templateValue: type.name === 'string' ? `'${ value }'` : value,
  });
}

export function NormalizeValueOptionList(
  optionList?: Array<Readonly<ValueOption> | string>,
): ReadonlyArray<NormalizedValueOption> {
  return Object.freeze(optionList?.map(NormalizeValueOption) ?? []);
}
