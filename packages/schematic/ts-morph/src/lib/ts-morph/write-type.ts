import {
  CoerceImports,
  IsTypeImport,
  TypeImport,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  CodeBlockWriter,
  SourceFile,
  WriterFunction,
} from 'ts-morph';

export type WriteType = string | TypeImport | WriterFunction;

export interface WriteTypeOptions {
  isArray?: boolean | null;
  type: WriteType;
}

export function IsWriteTypeOptions(value: any): value is WriteTypeOptions {
  return value && typeof value === 'object' && value.type;
}

/**
 * Uses the CodeBlockWriter to write the type to the AST thereby the value of the property type is evaluated
 * to determine the value that should be written to the AST
 * @param type
 * @param w
 * @constructor
 */
export function WriteStringType(type: string, w: CodeBlockWriter) {
  switch (type) {
    case 'date':
      w.write('Date');
      break;
    case 'uuid':
      w.write('string');
      break;
    default:
      w.write(type);
      break;
  }
}

export function WriteType(type: WriteType, sourceFile?: SourceFile): void;
export function WriteType(property: WriteTypeOptions, sourceFile?: SourceFile): void;
export function WriteType(propertyOrType: WriteTypeOptions | WriteType, sourceFile?: SourceFile) {
  let isArray = false;
  let type: WriteType;
  if (IsWriteTypeOptions(propertyOrType)) {
    isArray = propertyOrType.isArray ?? isArray;
    type = propertyOrType.type;
  } else {
    type = propertyOrType;
  }
  if (IsTypeImport(type)) {
    if (sourceFile) {
      CoerceImports(sourceFile, TypeImportToImportStructure(type));
    } else {
      console.warn('WriteType :: No source file provided to coerce imports');
    }
  }
  return (w: CodeBlockWriter) => {
    if (isArray) {
      w.write('Array<');
    }
    if (typeof type === 'string') {
      WriteStringType(type, w);
    } else if (typeof type === 'function') {
      type(w);
    } else if (IsTypeImport(type)) {
      WriteStringType(type.name, w);
    } else {
      throw new Error('Invalid type');
    }
    if (isArray) {
      w.write('>');
    }
  };
}
