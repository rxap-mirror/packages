import * as http from 'http';
import * as https from 'https';

/**
 * Performs an HTTP GET request to retrieve JSON data from the specified URL.
 *
 * This function supports both HTTP and HTTPS protocols based on the URL provided.
 * It returns a promise that resolves with the JSON parsed data if the request is successful
 * and the response contains valid JSON content. If the request fails or the response is not
 * valid JSON, the promise is rejected with an error message.
 *
 * @param {string} url - The URL from which to fetch data. Must be a valid HTTP or HTTPS URL.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON data as type T, or rejects with an error message.
 *
 * @template T - The type of the JSON data expected to be returned by the server.
 *
 * ### Example
 *
 * interface User {
 * id: number;
 * name: string;
 * }
 *
 * const userPromise: Promise<User> = HttpRequest<User>('https://api.example.com/users/1');
 * userPromise.then(user => console.log(user.name)).catch(error => console.error(error));
 * ```
 *
 * ### Error Handling
 * - If the status code of the response is not 200, the promise is rejected with "Request Failed. Status Code: [statusCode]".
 * - If the content type of the response is not `application/json`, the promise is rejected with "Invalid content-type. Expected application/json but received [contentType]".
 * - If there is an error in parsing the JSON data, the promise is rejected with the parsing error message.
 * - Network errors or other request issues result in a promise rejection with the respective error message.
 */
export function HttpRequest<T>(url: string): Promise<T> {

  function callback(resolve: (value: any) => void, reject: (error: any) => void) {

    return function (res: http.IncomingMessage) {

      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
          `Status Code: ${ statusCode }`);
      } else if (contentType && !/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
          `Expected application/json but received ${ contentType }`);
      }
      if (error) {
        // Consume response data to free up memory
        res.resume();
        console.error(error.message);
        reject(error.message);
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e: any) {
          console.error(e.message);
          reject(e.message);
        }
      });

    };

  }

  if (url.match(/^https/)) {
    return new Promise<T>((resolve, reject) => {
      https.get(url, callback(resolve, reject)).on('error', e => reject(e.message));
    });
  } else {
    return new Promise<T>((resolve, reject) => {
      http.get(url, callback(resolve, reject)).on('error', e => reject(e.message));
    });
  }

}
