import { PipeOptionToTypeImport } from './pipe-option-to-type-import';
import { NormalizedPipeOption } from './pipe-option';

describe('PipeOptionToTypeImport', () => {
  it('should map NormalizedPipeOption to NormalizedTypeImport', () => {
    const pipeOption: NormalizedPipeOption = {
      name: 'test-pipe',
      namedImport: 'TestPipe',
      moduleSpecifier: '@test/pipes',
      namespaceImport: 'testNamespace',
      isTypeOnly: true,
      defaultImport: 'DefaultPipe',
      argumentList: [],
    };

    const result = PipeOptionToTypeImport(pipeOption);

    expect(result).toEqual({
      name: 'test-pipe',
      namedImport: 'TestPipe',
      moduleSpecifier: '@test/pipes',
      namespaceImport: 'testNamespace',
      isTypeOnly: true,
      defaultImport: 'DefaultPipe',
    });
    // Ensure argumentList is NOT included
    expect((result as any).argumentList).toBeUndefined();
  });
});
