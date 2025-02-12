export function cleanupJsDoc(jsDoc: string) {

  const cleanJsDocArray = jsDoc
    .split('\n')
    .map(line => line
      .trim()
      .replace(/^\/\*\*/, '')
      .replace(/^\s?\*\//, '')
      .replace(/^\s?\*\s?/, '')
      .replace(/^\s?\*\s```typescript/, ' *')
      .trim(),
    );

  cleanJsDocArray.pop();

  return cleanJsDocArray.join('\n');

}
