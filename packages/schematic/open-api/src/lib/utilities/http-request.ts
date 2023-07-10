import * as http from 'http';
import * as https from 'https';

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
