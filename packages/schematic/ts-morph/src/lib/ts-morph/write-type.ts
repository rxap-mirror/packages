import {
  CodeBlockWriter,
  WriterFunction,
} from 'ts-morph';

export function WriteType(property: { type: string | WriterFunction, isArray?: boolean }) {
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
    } else {
      property.type(w);
    }
    if (property.isArray) {
      w.write('>');
    }
  };
}
