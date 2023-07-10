import { parseValue } from './parse-value';

describe('XML Parser', () => {

  describe('Parse Value', () => {

    it('should parse string', () => {

      expect(parseValue('user')).toEqual('user');
      expect(parseValue('"1"')).toEqual('1');
      expect(parseValue('"{ "username": "my-username" }"')).toEqual('{ "username": "my-username" }');
      expect(parseValue('"true"')).toEqual('true');
      expect(parseValue('')).toEqual('');

    });

    it('should parse number', () => {

      expect(parseValue('1')).toEqual(1);
      expect(parseValue('0')).toEqual(0);
      expect(parseValue('-1')).toEqual(-1);

    });

    it('should parse boolean', () => {

      expect(parseValue('true')).toEqual(true);
      expect(parseValue('false')).toEqual(false);

    });

    it('should parse null', () => {

      expect(parseValue('null')).toEqual(null);

    });

    it('should parse undefined', () => {

      expect(parseValue('undefined')).toEqual(undefined);

    });

    it('should parse json object', () => {

      expect(parseValue('{ "username": "my-username" }')).toEqual({'username': 'my-username'});
      expect(parseValue('[{ "username": "my-username" }]')).toEqual([{'username': 'my-username'}]);

    });

  });

});
