// region utilities
export * from './lib/utilities/get-extended-types';
export * from './lib/utilities/is-parsed-element';
export * from './lib/utilities/is-type-of';
// endregion

// region testing
export * from './lib/testing/testing-xml-parser-service';
// endregion

// region elements
export * from './lib/elements/data-source.element';
export * from './lib/elements/definition.element';
export * from './lib/elements/icon.element';
export * from './lib/elements/option.element';
export * from './lib/elements/parsed-element';
// endregion

// region decorators utilities
export * from './lib/decorators/utilities/add-parser-to-metadata';
export * from './lib/decorators/utilities/add-serializer-to-metadata';
// endregion

// region decorators mixins
export * from './lib/decorators/mixins/attribute-element.mixin';
export * from './lib/decorators/mixins/child-element.mixin';
export * from './lib/decorators/mixins/children-element.mixin';
export * from './lib/decorators/mixins/default-value-element.mixin';
export * from './lib/decorators/mixins/parse-value-element.mixin';
export * from './lib/decorators/mixins/path-element.mixin';
export * from './lib/decorators/mixins/raw-element.mixin';
export * from './lib/decorators/mixins/required-element.mixin';
export * from './lib/decorators/mixins/serialize-value-element.mixin';
export * from './lib/decorators/mixins/tag-element.mixin';
export * from './lib/decorators/mixins/text-content-element.mixin';
// endregion

// region decorators
export * from './lib/decorators/attribute';
export * from './lib/decorators/element-attribute';
export * from './lib/decorators/element-child-raw-content';
export * from './lib/decorators/element-child-text-content';
export * from './lib/decorators/element-child';
export * from './lib/decorators/element-children-text-content';
export * from './lib/decorators/element-children';
export * from './lib/decorators/element-clear-parser';
export * from './lib/decorators/element-def';
export * from './lib/decorators/element-extends';
export * from './lib/decorators/element-namespace';
export * from './lib/decorators/element-record';
export * from './lib/decorators/element-text-content';
export * from './lib/decorators/element-virtual';
export * from './lib/decorators/element.parser';
export * from './lib/decorators/element.serializer';
export * from './lib/decorators/metadata-keys';
export * from './lib/decorators/required-property';
export * from './lib/decorators/utilities';
// endregion

// region 
export * from './lib/create-element';
export * from './lib/create-root';
export * from './lib/default-to-json';
export * from './lib/element-factory';
export * from './lib/element-name';
export * from './lib/element';
export * from './lib/error';
export * from './lib/parse-value';
export * from './lib/serialize-value';
export * from './lib/xml-element-parser-function';
export * from './lib/xml-element-serializer-function';
export * from './lib/xml-parser.service';
export * from './lib/xml-serializer.service';
// endregion
