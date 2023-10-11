import { SetMetadata } from '@nestjs/common';

export const IS_INTERNAL_KEY = Symbol('isInternal');
export const Internal = () => SetMetadata(IS_INTERNAL_KEY, true);
