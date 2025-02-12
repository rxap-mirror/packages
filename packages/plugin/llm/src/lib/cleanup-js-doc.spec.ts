import { cleanupJsDoc } from './cleanup-js-doc';

describe('cleanupJsDoc', () => {

  it('should remove comment prefix with simple example', () => {

    const jsDoc = `/**
 * @param string - The string to slugify.
 * @param options - Options for slugifying the string.
 * @param customMap - A custom map of characters to replace.
 * @returns The slugified string.
 *
 * @example
 * \`\`\`typescript
 * slugify('hello world'); // 'hello-world'
 * \`\`\`
 */
`;
    expect(cleanupJsDoc(jsDoc)).toMatchSnapshot();

  });

  it('should remove comment prefix with complex example', () => {

    const jsDoc = `/**
 * A map of special characters to their ASCII representation. This map contains a comprehensive set of character mappings including currency symbols, diacritical marks, mathematical symbols, and various language-specific characters from different writing systems (Latin, Cyrillic, Georgian, etc.).
 *
 * @example
 * \`\`\`typescript
 * // Example of some mappings
 * {
 *   "£": "pound",
 *   "€": "euro",
 *   "Ä": "A",
 *   "ß": "ss",
 *   "Ж": "Zh"
 * }
 * \`\`\`
 *
 * @default A large JSON object containing character mappings for transliteration
 */`;

    expect(cleanupJsDoc(jsDoc)).toMatchSnapshot();

  });

});
