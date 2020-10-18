import { RxapError } from '@rxap/utilities';

export class RxapXmlParserError extends RxapError {

  constructor(message: string, code: string, className?: string) {
    super('@rxap/xml-parser', message, code, className);
  }

}
