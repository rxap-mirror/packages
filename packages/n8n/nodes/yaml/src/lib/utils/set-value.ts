import {
  FieldType,
  getValueDescription,
  INode,
  NodeOperationError,
  validateFieldType,
} from 'n8n-workflow';

export const validateEntry = (
  name: string,
  type: FieldType,
  value: unknown,
  node: INode,
  itemIndex: number,
  ignoreErrors = false,
) => {
  if (value === undefined || value === null) {
    return { name, value: null };
  }

  const description = `To fix the error try to change the type for the field "${name}" or activate the option “Ignore Type Conversion Errors” to apply a less strict type validation`;

  if (type === 'string') {
    if (value === undefined || value === null) {
      if (ignoreErrors) {
        return { name, value: null };
      } else {
        throw new NodeOperationError(
          node,
          `'${name}' expects a ${type} but we got ${getValueDescription(value)} [item ${itemIndex}]`,
          { description },
        );
      }
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else {
      value = String(value);
    }
  }

  const validationResult = validateFieldType(name, value, type);

  if (!validationResult.valid) {
    if (ignoreErrors) {
      return { name, value: value ?? null };
    } else {
      const message = `${validationResult.errorMessage} [item ${itemIndex}]`;
      throw new NodeOperationError(node, message, {
        itemIndex,
        description,
      });
    }
  }

  return {
    name,
    value: validationResult.newValue ?? null,
  };
};
