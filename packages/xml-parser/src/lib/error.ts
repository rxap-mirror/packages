import { RxapError } from '@rxap/utilities';

export class RxapXmlParserError extends RxapError {

  constructor(message: string, code: string, scope?: string) {
    super('@rxap/xml-parser', message, code, scope);
    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlParserError);
    }
    this.name = 'RxapXmlParserError';
  }

}

export class RxapXmlParserValidateError extends RxapXmlParserError {

  constructor(message: string, public readonly elementTag: string, public readonly attribute?: string) {
    super(message, '0000');

    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlParserValidateError);
    }

    this.name = 'XmlParserValidateError';
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      elementTag: this.elementTag,
      attribute: this.attribute,
    };
  }

}

export class RxapXmlParserValidateRequiredError extends RxapXmlParserValidateError {

  constructor(
    message: string,
    public override readonly elementTag: string,
    public override readonly attribute?: string,
  ) {
    super(message, '0000');

    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlParserValidateError);
    }

    this.name = 'RxapXmlParserValidateRequiredError';
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      elementTag: this.elementTag,
      attribute: this.attribute,
    };
  }

}

export class RxapXmlSerializerError extends RxapError {

  constructor(message: string, code: string, scope?: string) {
    super('@rxap/xml-parser', message, code, scope);
    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlSerializerError);
    }
    this.name = 'RxapXmlSerializerError';
  }

}

export class RxapXmlSerializerValidateError extends RxapXmlSerializerError {

  constructor(message: string, public readonly elementTag: string, public readonly attribute?: string) {
    super(message, '0000');

    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlSerializerValidateError);
    }

    this.name = 'XmlSerializerValidateError';
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      elementTag: this.elementTag,
      attribute: this.attribute,
    };
  }

}

export class RxapXmlSerializerValidateRequiredError extends RxapXmlSerializerValidateError {

  constructor(
    message: string,
    public override readonly elementTag: string,
    public override readonly attribute?: string,
  ) {
    super(message, '0000');

    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapXmlSerializerValidateError);
    }

    this.name = 'RxapXmlSerializerValidateRequiredError';
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      elementTag: this.elementTag,
      attribute: this.attribute,
    };
  }

}
