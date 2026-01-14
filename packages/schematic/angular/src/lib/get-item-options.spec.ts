import { GetItemOptions } from './get-item-options';

describe('GetItemOptions', () => {
  it('should return correct options based on shared property and modifiers', () => {
    expect(GetItemOptions({ shared: true, modifiers: [] })).toEqual({
      hasSharedModifier: true,
      hasCollectionModifier: false,
      hasEditModifier: false,
    });

    expect(GetItemOptions({ shared: false, modifiers: ['shared', 'collection', 'edit'] })).toEqual({
      hasSharedModifier: true,
      hasCollectionModifier: true,
      hasEditModifier: true,
    });

    expect(GetItemOptions({ shared: false, modifiers: [] })).toEqual({
      hasSharedModifier: false,
      hasCollectionModifier: false,
      hasEditModifier: false,
    });
  });
});
