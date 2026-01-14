interface ItemOptions {
  hasSharedModifier: boolean;
  hasCollectionModifier: boolean;
  hasEditModifier: boolean;
}

export function GetItemOptions(normalizedOptions: { modifiers: string[], shared: boolean }): ItemOptions {
  const {
    shared,
    modifiers,
  } = normalizedOptions;
  return {
    hasSharedModifier: shared || !!modifiers?.includes('shared'),
    hasCollectionModifier: !!modifiers?.includes('collection'),
    hasEditModifier: !!modifiers?.includes('edit'),
  };
}