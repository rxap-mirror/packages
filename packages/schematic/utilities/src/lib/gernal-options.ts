import {
  dasherize,
  Normalized,
} from '@rxap/utilities';

export type OverwriteOptions = boolean | string[];

export interface GlobalOptions {
  project: string;
  feature?: string;
  overwrite?: OverwriteOptions;
  replace?: boolean;
}

export interface NormalizedGlobalOptions extends Readonly<Normalized<GlobalOptions>> {
  overwrite: OverwriteOptions;
}

export function NormalizeGlobalOptions(options: GlobalOptions): NormalizedGlobalOptions {
  return Object.seal({
    project: dasherize(options.project),
    feature: options.feature ? dasherize(options.feature) : null,
    overwrite: options.overwrite ?? false,
    replace: options.replace ?? false,
  });
}

export function PrintGeneralOptions(schematicName: string, options: NormalizedGlobalOptions) {
  const {
    feature,
    project,
    overwrite,
    replace,
  } = options;
  console.log(
    `\x1b[35m===== Generating ${ schematicName } for project '${ project }' in feature '${ feature }' ...\x1b[0m`,
  );
  if (overwrite) {
    console.log('\x1b[31m===== Override files ...\x1b[0m');
  }
  if (replace) {
    console.log('\x1b[31m===== Replace files ...\x1b[0m');
  }

}
