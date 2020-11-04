import {
  ObjectLiteralExpression,
  WriterFunction
} from 'ts-morph';

export function OverwriteProperty(ole: ObjectLiteralExpression, name: string, initializer: string | WriterFunction) {
  const property = ole.getProperty(name);
  property?.remove();
  ole.addPropertyAssignment({
    name,
    initializer
  });
}
