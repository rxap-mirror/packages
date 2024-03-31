export interface GlobAsset {
  input: string,
  glob: string,
  output: string
}

export type Assets = Array<string | GlobAsset>;

export function IndexOfGlobalAsset(assets: Assets, asset: GlobAsset): number {
  return assets.findIndex(a => typeof a ===
    'object' &&
    a.glob ===
    asset.glob &&
    a.input ===
    asset.input &&
    a.output ===
    asset.output);
}

export function CoerceAssets(current: Assets, coerce: Assets) {

  for (const asset of coerce) {

    if (typeof asset === 'string') {
      if (!current.includes(asset)) {
        current.push(asset);
      }
    } else {
      if (!current.some(a => typeof a ===
        'object' &&
        a.input ===
        asset.input &&
        a.glob ===
        asset.glob &&
        a.output ===
        asset.output)) {
        current.push(asset);
      }
    }

  }

}

export function RemoveAssets(current: Assets, coerce: Assets) {

  for (const asset of coerce) {

    if (typeof asset === 'string') {
      const index = current.indexOf(asset);
      if (index !== -1) {
        current.splice(index, 1);
      }
    } else {
      const index = IndexOfGlobalAsset(current, asset);
      if (index !== -1) {
        current.splice(index, 1);
      }
    }

  }

}
