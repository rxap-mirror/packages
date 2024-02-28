import {
  classTransformOptions,
  validatorOptions,
} from '@rxap/nest-utilities';
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';
import {
  validateSync,
  ValidatorOptions,
} from 'class-validator';

export function ToDtoInstance<T>(cls: ClassConstructor<T>, plain: T[], options?: ClassTransformOptions, validatorOptions?: ValidatorOptions): T[];
export function ToDtoInstance<T>(cls: ClassConstructor<T>, plain: T, options?: ClassTransformOptions, validatorOptions?: ValidatorOptions): T;
export function ToDtoInstance<T>(
  cls: ClassConstructor<T>,
  plain: T | T[],
  options: ClassTransformOptions = classTransformOptions,
  vOptions: ValidatorOptions = validatorOptions,
): T | T[] {
  const instance: T | T[] = plainToInstance(cls, plain, options);
  if (Array.isArray(instance)) {
    for (const item of instance) {
      validateSync(item, vOptions);
    }
  } else {
    validateSync(instance as object, vOptions);
  }
  return instance;
}
