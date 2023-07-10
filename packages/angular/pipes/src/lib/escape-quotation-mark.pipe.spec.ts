import { EscapeQuotationMarkPipe } from './escape-quotation-mark.pipe';

describe('@rxap/pipes', () => {

  describe('EscapeQuotationMarkPipe', () => {

    it('create an instance', () => {
      const pipe = new EscapeQuotationMarkPipe();
      expect(pipe).toBeTruthy();
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
