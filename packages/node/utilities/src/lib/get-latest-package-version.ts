import { get } from 'https';

export async function GetLatestPackageVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    get(`https://registry.npmjs.org/${ packageName }`, (res) => {
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            console.error(`Error getting npm package version: ${ jsonData.error }`);
            resolve(null);
          } else {
            const latestVersion = jsonData['dist-tags'].latest;
            resolve(latestVersion);
          }
        } catch (error: any) {
          console.error(`Error parsing npm JSON response: ${ error.message }`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`Network Error getting npm package version: ${ error.message }`);
      resolve(null);
    });
  });
}

