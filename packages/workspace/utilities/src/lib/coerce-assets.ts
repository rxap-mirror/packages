export interface GlobAsset {
  input: string,
  glob: string,
  output: string
}

export type Assets = Array<string | GlobAsset>;

/**
 * Searches for a global asset within a collection of assets and returns its index.
 *
 * This function performs a search on an array of asset objects to find the first asset that matches
 * the specified global asset in terms of `glob`, `input`, and `output` properties. It returns the
 * index of the matching asset if found, or -1 if no such asset exists in the collection.
 *
 * @param {Assets} assets - An array of asset objects to search within.
 * @param {GlobAsset} asset - The global asset object to find, characterized by its `glob`, `input`, and `output` properties.
 * @returns {number} The index of the first matching asset in the array, or -1 if no match is found.
 */
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

/**
 * Merges a list of assets into a current list of assets without duplicating existing entries.
 *
 * This function iterates over each asset in the `coerce` list and adds it to the `current` list if it does not already exist.
 * The function handles two types of assets:
 * 1. String assets: These are considered unique based on their string value.
 * 2. Object assets: These are considered unique based on a combination of their `input`, `glob`, and `output` properties.
 *
 * @param {Assets} current - The current list of assets to which new assets will be added.
 * @param {Assets} coerce - The list of new assets that need to be merged into the current list.
 */
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

/**
 * Removes specified assets from a collection of assets.
 *
 * This function iterates over each asset in the `coerce` array and removes it from the `current` array if found.
 * The function supports removal of assets represented as strings directly using `indexOf`, and more complex asset types
 * using a custom `IndexOfGlobalAsset` function to determine the index.
 *
 * @param {Assets} current - The array of current assets from which assets will be removed.
 * @param {Assets} coerce - The array of assets to be removed from the current array.
 */
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
