/**
 * This function is used to download a JavaScript object as a JSON file.
 *
 * @export
 * @function DownloadObjectAsJsonFile
 *
 * @param {any} exportObj - The JavaScript object that needs to be downloaded as a JSON file.
 * This object can be of any type that is valid in JavaScript, including arrays, objects, numbers, strings, etc.
 *
 * @param {any} exportName - The name of the file to be downloaded. This can be any valid string.
 * The function will append '.json' to this string to create the filename of the downloaded file.
 *
 * The function first converts the JavaScript object into a JSON string using the JSON.stringify method.
 * It then encodes this string using the encodeURIComponent function to ensure that it can be safely included in a URL.
 *
 * The function then creates a new 'a' (anchor) element in the document.
 * It sets the 'href' attribute of this element to a data URL that contains the JSON string.
 * It also sets the 'download' attribute of the element to the filename.
 *
 * The function then appends the anchor element to the body of the document.
 * This is necessary for the download to work in Firefox.
 *
 * Finally, the function simulates a click on the anchor element, which causes the browser to download the file.
 * After the download is initiated, the function removes the anchor element from the document.
 */
export function DownloadObjectAsJsonFile(exportObj: any, exportName: any) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
