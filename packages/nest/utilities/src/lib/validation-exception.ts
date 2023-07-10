import {HttpException, HttpStatus, ValidationError} from '@nestjs/common';
// import ValidationError from @nestjs/common instead of class-validator, so that this package can be used without
// the class-validator package installed

export function ValidationErrorListToString(errors: ReadonlyArray<ValidationError>): string {
  const groups: Record<string, ValidationError[]> = {};

  for (const error of errors) {
    const name = error.target?.constructor.name ?? 'Unknown';
    groups[name] ??= [];
    groups[name].push(error);
  }

  let message = 'Validation Errors:\n';

  for (const group of Object.keys(groups)) {
    message += `An instance of '${group}' has failed the validation:\n`;
    message += groups[group].map(error => `\t- property '${error.property}' has failed the following constraints: ${Object.keys(error.constraints ?? {}).join(', ')}`).join('\n')
  }

  return message;
}

export class ValidationException extends Error {

  constructor(public readonly validationErrorList: ReadonlyArray<ValidationError>) {
    super(ValidationErrorListToString(validationErrorList));
  }

}

export class ValidationHttpException extends HttpException {

  constructor(public readonly validationErrorList: ReadonlyArray<ValidationError>, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super({
      statusCode,
      message: ValidationErrorListToString(validationErrorList),
      errors: validationErrorList,
    }, statusCode);
  }

}
