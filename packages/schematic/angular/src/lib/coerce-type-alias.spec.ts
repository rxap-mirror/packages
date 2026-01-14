import { CoerceTypeAlias } from './coerce-type-alias';

describe('CoerceTypeAlias', () => {
  it('should get existing type alias', () => {
    const typeAlias = {};
    const sourceFile = {
      getTypeAlias: jest.fn(() => typeAlias),
      addTypeAlias: jest.fn(),
    };
    const result = CoerceTypeAlias(sourceFile as any, 'MyType', { type: 'string' });
    expect(result).toBe(typeAlias);
    expect(sourceFile.getTypeAlias).toHaveBeenCalledWith('MyType');
    expect(sourceFile.addTypeAlias).not.toHaveBeenCalled();
  });

  it('should add new type alias if it does not exist', () => {
    const typeAlias = {};
    const sourceFile = {
      getTypeAlias: jest.fn(() => null),
      addTypeAlias: jest.fn(() => typeAlias),
    };
    const result = CoerceTypeAlias(sourceFile as any, 'MyType', { type: 'string' });
    expect(result).toBe(typeAlias);
    expect(sourceFile.addTypeAlias).toHaveBeenCalledWith({ name: 'MyType', type: 'string' });
  });
});
