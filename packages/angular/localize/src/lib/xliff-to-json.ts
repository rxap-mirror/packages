// @ts-expect-error type definition do not exists
import { xliff2js } from 'xliff/esm';

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
