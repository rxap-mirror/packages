import {ChildElementParserMixin} from './child-element-parser.mixin';
import {ElementDef} from '../element-def';
import {ParsedElement} from '../../elements/parsed-element';

describe('@rxap/xml-parser', () => {

  describe('Mixins', () => {

    describe('ChildElementParserMixin', () => {

      it('should throw if the child element tag is not defined', () => {

        class MyChildElement implements ParsedElement {
          public static TAG: string;

          public validate(): boolean {
            return true;
          }
        }

        const parser = new ChildElementParserMixin(MyChildElement);

        expect(() => parser.tag).toThrowError();

      });

      it('should return child element tag if the tag is not defined in the options', () => {

        @ElementDef('my-child')
        class MyChildElement implements ParsedElement {
          public static TAG: string;

          public validate(): boolean {
            return true;
          }
        }

        const parser = new ChildElementParserMixin(MyChildElement);

        expect(parser.tag).toBe('my-child');

      });

    });

  });

});
