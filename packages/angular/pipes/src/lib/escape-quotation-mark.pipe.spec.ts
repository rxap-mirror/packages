import { EscapeQuotationMarkPipe } from './escape-quotation-mark.pipe';

describe('@rxap/pipes', () => {

  describe('EscapeQuotationMarkPipe', () => {

    it('create an instance', () => {
      const pipe = new EscapeQuotationMarkPipe();
      expect(pipe).toBeTruthy();
    });

    it('should unescape quotation marks in reverse mode', () => {

      const pipe = new EscapeQuotationMarkPipe();

      expect(pipe.transform('\\"', true)).toEqual('"');
      expect(pipe.transform('\\"Test\\"', true)).toEqual('"Test"');
      expect(pipe.transform(pipe.transform('{"a":"b"}'), true)).toEqual('{"a":"b"}');
      expect(pipe.transform('', true)).toEqual('');

    });

    it('should escape quotation mark', () => {

      const pipe = new EscapeQuotationMarkPipe();

      expect(pipe.transform('"')).toEqual('\\"');
      expect(pipe.transform('"Test"')).toEqual('\\"Test\\"');
      expect(pipe.transform('"Test": "Test"')).toEqual('\\"Test\\": \\"Test\\"');
      expect(pipe.transform(JSON.stringify({ data: 'data' }))).toEqual('{\\"data\\":\\"data\\"}');

    });

  });

});
