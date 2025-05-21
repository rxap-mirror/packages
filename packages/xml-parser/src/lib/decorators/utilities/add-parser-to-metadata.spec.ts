import { getMetadata } from '@rxap/reflect-metadata';
import {
  AddParserToMetadata,
  ElementParserMetaData,
} from '@rxap/xml-parser';
import { ElementParser } from '../element.parser';

describe('AddParserToMetadata', () => {

  let elementParser: ElementParser;

  beforeEach(() => {
    elementParser = {
      propertyKey: 'id',
      options: {},
      parse: jest.fn()
    };
    Reflect.set(elementParser.parse, 'propertyKey', elementParser.propertyKey);
  });

  it('should add parser to metadata', () => {

    class Test {}

    AddParserToMetadata(elementParser, Test.prototype);
    expect(getMetadata(ElementParserMetaData.PARSER, Test)).toHaveLength(1);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER, Test)![0]).toBe(elementParser.parse);
    expect(getMetadata(ElementParserMetaData.PARSER_INSTANCE, Test.prototype)).toHaveLength(1);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, Test.prototype)![0]).toBe(elementParser);

  });

  it('should replace parser if an parser with the same property key already exists in a parent class', () => {

    class Parent {}

    class Child extends Parent {}

    AddParserToMetadata(elementParser, Parent.prototype);

    const childElementParser = {
      propertyKey: 'id',
      options: { test: 'child' },
      parse: jest.fn(),
    };
    Reflect.set(childElementParser.parse, 'propertyKey', childElementParser.propertyKey);

    AddParserToMetadata(childElementParser, Child.prototype);
    expect(getMetadata(ElementParserMetaData.PARSER, Child)).toHaveLength(1);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER, Child)![0]).toBe(childElementParser.parse);
    expect(getMetadata(ElementParserMetaData.PARSER_INSTANCE, Child.prototype)).toHaveLength(1);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, Child.prototype)![0]).toBe(childElementParser);

  });

  it('should not replace parser if declared in the same class only if the parser is declared in the parent class', () => {

    class Parent {}

    class Child extends Parent {}

    AddParserToMetadata(elementParser, Parent.prototype);

    const childElementParserA = {
      propertyKey: 'id',
      options: { test: 'childA' },
      parse: jest.fn(),
    };
    Reflect.set(childElementParserA.parse, 'propertyKey', childElementParserA.propertyKey);
    AddParserToMetadata(childElementParserA, Child.prototype);

    const childElementParserB = {
      propertyKey: 'id',
      options: { test: 'childB' },
      parse: jest.fn(),
    };
    Reflect.set(childElementParserB.parse, 'propertyKey', childElementParserB.propertyKey);
    AddParserToMetadata(childElementParserB, Child.prototype);

    expect(getMetadata(ElementParserMetaData.PARSER, Child)).toHaveLength(2);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER, Child)![0]).toBe(childElementParserA.parse);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER, Child)![1]).toBe(childElementParserB.parse);
    expect(getMetadata(ElementParserMetaData.PARSER_INSTANCE, Child.prototype)).toHaveLength(2);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, Child.prototype)![0]).toBe(childElementParserA);
    expect(getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, Child.prototype)![1]).toBe(childElementParserB);

  });

});
