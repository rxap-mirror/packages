import type { ClassTransformOptions } from 'class-transformer';

export const classTransformOptions: ClassTransformOptions = {
  enableImplicitConversion: true,
  exposeDefaultValues: true,
  excludeExtraneousValues: true,
  exposeUnsetFields: false,
};

/**
 * @deprecated use classTransformOptions instead
 */
export const transformOptions = classTransformOptions;

export function ClassTransformOptionsFactory(additionalOptions: ClassTransformOptions = {}) {
  return {
    ...classTransformOptions,
    ...additionalOptions,
  };
}

/**
 * @deprecated use ClassTransformOptions instead
 */
export const TransformOptions = ClassTransformOptionsFactory;
