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

  return Object.keys(xliffContent).reduce((result: any, current) => {
    const translation = xliffContent[current].target;
    if (typeof translation === "string") {
      result[current] = translation;
    } else if (Array.isArray(translation)) {
      result[current] = translation
        .map((entry) =>
          typeof entry === "string" ? entry : `{{${entry.Standalone.id}}}`,
        )
        .join("");
    } else if (typeof translation === "object" && 'Standalone' in translation && translation.Standalone.id !== '') {
      result[current] = `{{${translation.Standalone.id}}}`;
    } else {
      console.warn(`Could not parse XLIFF: (${current}) ${ JSON.stringify(xliffContent[current]) }`);
      return result;
    }
    result[current] = result[current].replace("{{", "{$").replace("}}", "}");
    return result;
  }, {});
}
