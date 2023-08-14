import {
  CodeBlockWriter,
  WriterFunction,
} from 'ts-morph';

export interface WriteTypeOptions {
  isArray?: boolean;
  type: string | WriterFunction;
}

export function WriteType(property: WriteTypeOptions) {
  return (w: CodeBlockWriter) => {
    if (property.isArray) {
      w.write('Array<');
    }
    if (typeof property.type === 'string') {
      switch (property.type) {
        case 'date':
          w.write('Date');
          break;
        case 'uuid':
          w.write('string');
          break;
        default:
          w.write(property.type);
          break;
      }
    } else if (typeof property.type === 'function') {
      property.type(w);
    } else {
      throw new Error('Invalid type');
    }
    if (property.isArray) {
      w.write('>');
    }
  };
}
