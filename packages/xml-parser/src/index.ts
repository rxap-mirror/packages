export * from './lib/element';
export * from './lib/parse-value';
export * from './lib/xml-parser.service';
export * from './lib/decorators/required-property';
export * from './lib/decorators/metadata-keys';
export * from './lib/decorators/attribute';
export { ParsedElement } from './lib/elements/parsed-element';
export { ElementParser } from './lib/decorators/element-parser';
export { ElementName } from './lib/element-name';
export { XmlElementParserFunction } from './lib/xml-element-parser-function';
export * from './lib/error';
export * from './lib/element-factory';

// region decorators

export * from './lib/decorators/utilities';
export {
  ElementAttribute,
  ElementAttributeOptions,
} from './lib/decorators/element-attribute';
export {
  ElementChild,
  ElementChildOptions,
} from './lib/decorators/element-child';
export {
  ElementChildren,
  ElementChildrenOptions,
} from './lib/decorators/element-children';
export {
  ElementChildTextContent,
  ElementChildTextContentOptions,
} from './lib/decorators/element-child-text-content';
export {
  ElementChildrenTextContent,
  ElementChildrenTextContentOptions,
} from './lib/decorators/element-children-text-content';
export {
  ElementTextContent,
  ElementTextContentOptions,
} from './lib/decorators/element-text-content';
export { ElementRequired } from './lib/decorators/mixins/required-element.parser.mixin';
export { ElementDef } from './lib/decorators/element-def';
export { ElementExtends } from './lib/decorators/element-extends';
export { ElementClearParser } from './lib/decorators/element-clear-parser';
export {
  ElementRecord,
  ElementRecordOptions,
} from './lib/decorators/element-record';
export {
  ElementChildRawContent,
  ElementChildRawContentOptions,
} from './lib/decorators/element-child-raw-content';

// endregion

// region elements

export * from './lib/elements/data-source.element';
export * from './lib/elements/icon.element';
export * from './lib/elements/option.element';
export * from './lib/elements/definition.element';

// endregion

// region testing

export * from './lib/testing/testing-xml-parser-service';

// endregion
