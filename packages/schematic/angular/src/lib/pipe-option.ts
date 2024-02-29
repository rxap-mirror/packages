import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  NormalizedValueOption,
  NormalizeValueOptionList,
  ValueOption,
} from './value-option';


export interface PipeOption extends TypeImport {
  argumentList?: Array<ValueOption | string>;
}

export interface NormalizedPipeOption extends NormalizedTypeImport {
  argumentList: ReadonlyArray<NormalizedValueOption>;
}

function guessPipeType(name: string): TypeImport {
  switch (name) {
    case 'async':
      return {
        name: 'async',
        namedImport: 'AsyncPipe',
        moduleSpecifier: '@angular/common',
      };
    case 'date':
      return {
        name: 'date',
        namedImport: 'DatePipe',
        moduleSpecifier: '@angular/common',
      };
    case 'json':
      return {
        name: 'json',
        namedImport: 'JsonPipe',
        moduleSpecifier: '@angular/common',
      };
    case 'keyvalue':
      return {
        name: 'keyvalue',
        namedImport: 'KeyValuePipe',
        moduleSpecifier: '@angular/common',
      };
    case 'getFromObject':
      return {
        name: 'getFromObject',
        namedImport: 'GetFromObjectPipe',
        moduleSpecifier: '@rxap/pipes',
      };
    default:
      throw new Error(`Unknown pipe ${ name }`);
  }
}

export function NormalizePipeOption(options: Readonly<PipeOption> | string): Readonly<NormalizedPipeOption> {
  let type: TypeImport;
  let argumentList = typeof options === 'string' ? undefined : options.argumentList;
  if (typeof options === 'string') {
    const [ name, ...args ] = options.split(':');
    type = guessPipeType(name);
    argumentList = args;
  } else if (!options.namedImport) {
    type = guessPipeType(options.name);
  } else {
    type = options;
  }
  return Object.freeze({
    ...NormalizeTypeImport(type),
    argumentList: NormalizeValueOptionList(argumentList),
  });
}

export function NormalizePipeOptionList(
  optionList?: Array<Readonly<PipeOption> | string>,
): ReadonlyArray<NormalizedPipeOption> {
  return Object.freeze(optionList?.map(NormalizePipeOption) ?? []);
}

export function PipeOptionToTypeImport(option: NormalizedPipeOption): NormalizedTypeImport {
  return {
    name: option.name,
    namedImport: option.namedImport,
    moduleSpecifier: option.moduleSpecifier,
    namespaceImport: option.namespaceImport,
    isTypeOnly: option.isTypeOnly,
    defaultImport: option.defaultImport,
  };
}
