import { createElement } from './create-element';
import { IirdsRdfElementMixin } from './iirds-parser/mixin/iirds-rdf-element.mixin';
import { IirdsMetadataRdf } from './parse-metadata';
import { RdfElement } from './rdf-parser/rdf.element';

export function createRoot<T extends IirdsMetadataRdf>(
  properties: Partial<{ [K in keyof Element]: Element[K] }> = {}
): T {
  // @ts-expect-error Ensure the loading of the mixin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mixin = [IirdsRdfElementMixin];

  return createElement(RdfElement, properties as any) as T;
}
