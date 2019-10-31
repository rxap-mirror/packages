console.log('load content script');

let port: any;

let waiting: any[] = [];

function send(data: any) {
  if (port) {
    port.postMessage(data);
  } else {
    console.log('add to queue', data);
    waiting.push(data);
  }
}

function ping() {
  console.log('ping');
  chrome.runtime.sendMessage('ping', response => {
    if (chrome.runtime.lastError) {
      setTimeout(ping, 1000);
    } else {
      console.log('[content] ready');

      port = chrome.runtime.connect({ name: 'knockknock' });

      for (const d of waiting) {
        send(d);
      }
      waiting = [];

      // forward popup data to webpage
      port.onMessage.addListener((msg: any) => window.postMessage(msg, '*'));

    }
  });
}

window.addEventListener('message', message => {
  console.log('get content', message.data);
  const data = message.data;
  if (data.rxap_form) {
    if (data.start_connection) {
      console.log('[content] start connection');
      ping();
    } else {
      send(data);
    }
  }
}, false);

window.postMessage({ rxap_form: true, content_loaded: true }, '*');
