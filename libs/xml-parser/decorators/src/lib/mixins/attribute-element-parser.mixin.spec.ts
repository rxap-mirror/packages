import { AttributeElementParserMixin } from './attribute-element-parser.mixin';
import createSpy = jasmine.createSpy;

describe('@rxap/xml-parser/decorators', () => {

  describe('Mixin', () => {

    describe('AttributeElementParserMixin', () => {

      it('should use default parse value if no value parser is defined', () => {

        const parser = new AttributeElementParserMixin();

        expect(parser.parseValue('true')).toEqual(true);
        expect(parser.parseValue('"true"')).toEqual('true');
        expect(parser.parseValue('\'true\'')).toEqual('true');
        expect(parser.parseValue('false')).toEqual(false);
        expect(parser.parseValue('-1')).toEqual(-1);
        expect(parser.parseValue('1')).toEqual(1);
        expect(parser.parseValue('0')).toEqual(0);
        expect(parser.parseValue('my-value')).toEqual('my-value');
        expect(parser.parseValue('[]')).toEqual([]);
        expect(parser.parseValue('{}')).toEqual({});

      });

      it('should use defined value parser', () => {

        const parseValue = createSpy();
        const parser     = new AttributeElementParserMixin({ parseValue });

        parser.parseValue('my-value');

        expect(parseValue).toBeCalled();
        expect(parseValue).toBeCalledTimes(1);
        expect(parseValue).toBeCalledWith('my-value');

      });

    });

  });

});
