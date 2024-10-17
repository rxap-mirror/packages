import type { ValidatorOptions } from 'class-validator';

export const validatorOptions: ValidatorOptions = {
  enableDebugMessages: true,
  skipUndefinedProperties: false,
  skipNullProperties: false,
  skipMissingProperties: false,
  forbidUnknownValues: true,
};

export function ValidatorOptionsFactory(additionalOptions: ValidatorOptions = {}) {
  return {
    ...validatorOptions,
    ...additionalOptions,
  };
}
