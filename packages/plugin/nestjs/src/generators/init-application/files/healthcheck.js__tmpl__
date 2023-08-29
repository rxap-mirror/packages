const http = require('http');

let path = '/';

if (process.env.HEALTHCHECK_PATH) {
  path = process.env.HEALTHCHECK_PATH;
} else {
  if (process.env.GLOBAL_API_PREFIX) {
    path = '/' + process.env.GLOBAL_API_PREFIX + '/';
  }
  path += 'health';
}

const options = {
  host: '127.0.0.1',
  port: process.env.PORT,
  path,
  timeout: 30000,
};

const request = http.request(
  options,
  (res) => {
    console.log(`STATUS: ${ res.statusCode }`);
    if (res.statusCode === 200) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  },
);

request.on(
  'error',
  function (err) {
    console.log(`ERROR: ${ err.message }`);
    process.exit(1);
  },
);

request.end();
