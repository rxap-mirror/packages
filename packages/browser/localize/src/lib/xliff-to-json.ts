// @ts-expect-error type definition do not exists
import { xliff2js } from 'xliff/esm';

/**
 * Converts an XLIFF translation string into a JSON object with translation keys and their corresponding values.
 *
 * @param {string} translations - A string in XLIFF format containing translations to be parsed and transformed.
 * @return {Promise<Object>} A promise that resolves to an object where keys are translation identifiers and values are the corresponding translations in plain text or templated string format.
 */
export async function xliffToJson(translations: string) {
  const parserResult = await xliff2js(translations);
  const xliffContent = parserResult.resources["ngi18n"];

  return Object.keys(xliffContent)
    .reduce(
      (
        result: any,
        current,
      ) => {
        const translation = xliffContent[current].target;
        if (typeof translation === 'string') {
          result[current] = translation;
        } else if (Array.isArray(translation)) {
          result[current] = translation
            .map((entry) => {
              if (typeof entry === 'string') {
                return entry;
              }
              if ('Standalone' in entry && 'id' in entry.Standalone) {
                return `{{${ entry.Standalone.id }}}`;
              }
              if ('Span' in entry && 'contents' in entry.Span) {
                if (typeof entry.Span.contents === 'string') {
                  return entry.Span.contents;
                }
                if ('Standalone' in entry.Span.contents && 'id' in entry.Span.contents.Standalone) {
                  return `{{${ entry.Span.contents.Standalone.id }}}`;
                }
              }
              console.warn(`Could not parse XLIFF: (${ current }) ${ JSON.stringify(entry, null, 2) }`);
              return '';
            })
            .join('');
        } else if (translation && typeof translation === 'object' && 'Standalone' in translation && translation.Standalone.id !== '') {
          result[current] = `{{${ translation.Standalone.id }}}`;
        } else {
          console.warn(`Could not parse XLIFF: (${ current }) ${ JSON.stringify(xliffContent[current]) }`);
          return result;
        }
        result[current] = result[current]
          .replace(/\{\{/g, '{$')
          .replace(/\}\}/g, '}');
        return result;
      },
      {},
    );
}
