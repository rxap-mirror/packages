import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export function FirestoreErrorHandler<T>(logger: Logger): (err: T) => T {

  return (err: T): T => {

    const {message, code, details, note} = err as any;

    logger.error([message, note].join(': '));

    switch (code) {

      case 2:
        throw new InternalServerErrorException(`Unknown firestore error: ${note}`, details);

      case 5:
        throw new NotFoundException('Document not found', details);

    }

    logger.debug(`Error code: ${code} is not handled`);

    throw new InternalServerErrorException(message, details);

  }

}
