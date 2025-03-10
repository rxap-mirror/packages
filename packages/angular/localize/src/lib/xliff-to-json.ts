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
        .map((entry) => entry.replace("{{", "{$").replace("}}", "}"))
        .join("");
    } else {
      throw new Error("Could not parse XLIFF: " + JSON.stringify(translation));
    }
    return result;
  }, {});
}
