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

type OptionalMethods<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: T[P] extends Function ? never : T[P]
};

/**
 * Converts a plain object to an instance of the specified class, performs validation, and returns the instance.
 *
 * @template T - The type of the class.
 * @param {ClassConstructor<T>} cls - The constructor of the class to convert to.
 * @param {OptionalMethods<T>} plain - The plain object to convert to an instance.
 * @param {ClassTransformOptions} [options=classTransformOptions] - The options for class transformation.
 * @param {ValidatorOptions} [vOptions=validatorOptions] - The options for validation.
 * @returns {T} - The instance of the specified class.
 */
export function ToDtoInstance<T>(
  cls: ClassConstructor<T>,
  plain: OptionalMethods<T>,
  options: ClassTransformOptions = classTransformOptions,
  vOptions: ValidatorOptions = validatorOptions,
): T {
  const instance: T = plainToInstance(cls, plain, options);
  validateSync(instance as object, vOptions);
  return instance;
}

/**
 * Converts an array of plain objects to an array of instances of a specified class,
 * and validates each instance using the specified validator options.
 *
 * @template T - The class type to convert the plain objects into.
 * @param {ClassConstructor<T>} cls - The constructor function of the class.
 * @param {Array<OptionalMethods<T>>} plain - The array of plain objects to convert.
 * @param {ClassTransformOptions} [options=classTransformOptions] - The transformation options.
 * @param {ValidatorOptions} [vOptions=validatorOptions] - The options for validation.
 * @returns {T[]} - The array of instances of the specified class.
 */
export function ToDtoInstanceList<T>(
  cls: ClassConstructor<T>,
  plain: Array<OptionalMethods<T>>,
  options: ClassTransformOptions = classTransformOptions,
  vOptions: ValidatorOptions = validatorOptions,
): T[] {
  const instance: T[] = plainToInstance(cls, plain, options);
  for (const item of instance) {
    validateSync(item as object, vOptions);
  }
  return instance;
}
