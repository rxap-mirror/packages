import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

/**
 * FirestoreErrorHandler handles errors thrown by Firestore operations.
 * It logs the error using the provided logger and throws appropriate exceptions based on the error code.
 *
 * @template T - The type of error being handled.
 *
 * @param {Logger} logger - The logger to use for logging the error.
 *
 * @returns {(err: T) => T} - A function that accepts an error of type T and returns the same error after handling it.
 *
 * @throws {InternalServerErrorException} - If the error code is not handled or unknown.
 * @throws {NotFoundException} - If the error code is 5 (document not found).
 *
 * @example
 * const logger = new Logger();
 * const errorHandler = FirestoreErrorHandler(logger);
 * const error = {
 *   message: 'Some error message',
 *   code: 2,
 *   details: 'Some additional details',
 *   note: 'Some note',
 * };
 * errorHandler(error); // Throws InternalServerErrorException with the appropriate message and details.
 */
export function FirestoreErrorHandler<T>(logger: Logger): (err: T) => T {

  return (err: T): T => {

    const {
      message,
      code,
      details,
      note,
    } = err as any;

    logger.error([ message, note ].join(': '));

    switch (code) {

      case 2:
        throw new InternalServerErrorException(`Unknown firestore error: ${ note }`, details);

      case 5:
        throw new NotFoundException('Document not found', details);

    }

    logger.debug(`Error code: ${ code } is not handled`);

    throw new InternalServerErrorException(message, details);

  };

}
