export function cleanupJsDoc(jsDoc: string) {

  if (!(
    jsDoc.includes('/**') || jsDoc.includes('*/')
  )) {
    return jsDoc;
  }

  const cleanJsDocArray = jsDoc
    .split('\n')
    .map(line => line
      .trim()
      .replace(/^\/\*\*/, '')
      .replace(/^\*\//, '')
      .replace(/^\*\s/, '')
      .replace(/^\*$/, ''),
    );

  // cleanJsDocArray.pop();
  // cleanJsDocArray.shift();

  if (cleanJsDocArray[0].trim() === '') {
    cleanJsDocArray.shift();
  }

  if (cleanJsDocArray[cleanJsDocArray.length - 1].trim() === '') {
    cleanJsDocArray.pop();
  }

  return cleanJsDocArray.join('\n');

}
