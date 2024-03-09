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

export function ToDtoInstance<T>(
  cls: ClassConstructor<T>,
  plain: T,
  options: ClassTransformOptions = classTransformOptions,
  vOptions: ValidatorOptions = validatorOptions,
): T {
  const instance: T = plainToInstance(cls, plain, options);
  validateSync(instance as object, vOptions);
  return instance;
}

export function ToDtoInstanceList<T>(
  cls: ClassConstructor<T>,
  plain: T[],
  options: ClassTransformOptions = classTransformOptions,
  vOptions: ValidatorOptions = validatorOptions,
): T[] {
  const instance: T[] = plainToInstance(cls, plain, options);
  for (const item of instance) {
    validateSync(item as object, vOptions);
  }
  return instance;
}
