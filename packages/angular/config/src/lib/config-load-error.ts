/**
 * The kind of failure that happened while loading a config url.
 *
 * - `network`: `fetch()` rejected (offline, DNS, CORS without a redirect)
 * - `redirect`: the response is an `opaqueredirect` (only with `requestInit.redirect === 'manual'`)
 * - `http`: the response is not ok - `status` and `response` are available
 * - `parse`: the response body is not valid JSON
 * - `schema`: the schema validation failed
 */
export type ConfigLoadErrorKind =
  | 'network'
  | 'redirect'
  | 'http'
  | 'parse'
  | 'schema';

export interface ConfigLoadError {
  kind: ConfigLoadErrorKind;
  url: string;
  /**
   * true if the config url is required. A required url throws after the error handler is called,
   * an optional url resolves with `null`.
   */
  required: boolean;
  status?: number;
  response?: Response;
  cause?: unknown;
  /**
   * The message the default handler would show.
   */
  message: string;
}

/**
 * Called for every failed config url request. May never resolve, e.g. if it navigates away.
 */
export type ConfigLoadErrorHandler = (error: ConfigLoadError) => void | Promise<void>;

/**
 * The default config load error handler. Shows the error message in an overlay and reloads the
 * page after 30 s for required config urls. Logs a warning for optional config urls.
 *
 * Can be used as fallback in a custom error handler for error kinds it does not handle.
 */
export function defaultConfigLoadErrorHandler(error: ConfigLoadError): void {
  if (error.required) {
    showConfigLoadError(error.message);
  } else {
    console.warn(error.message);
  }
}

/**
 * Appends the message to the config error overlay and schedules a page reload in 30 s.
 */
export function showConfigLoadError(message: string) {
  const hasUl = document.getElementById('rxap-config-error') !== null;
  const ul = document.getElementById('rxap-config-error') ?? document.createElement('ul');
  ul.id = 'rxap-config-error';
  ul.style.position = 'fixed';
  ul.style.bottom = '16px';
  ul.style.right = '16px';
  ul.style.backgroundColor = 'white';
  ul.style.padding = '32px';
  ul.style.zIndex = '99999999';
  ul.style.color = 'black';
  const messageLi = document.createElement('li');
  messageLi.innerText = message;
  ul.appendChild(messageLi);
  const refreshHintLi = document.createElement('li');
  refreshHintLi.innerText = 'Please refresh the page to try again.';
  ul.appendChild(refreshHintLi);
  const autoRefreshHintLi = document.createElement('li');
  autoRefreshHintLi.innerText = 'The page will refresh automatically in 30 seconds.';
  ul.appendChild(autoRefreshHintLi);
  if (!hasUl) {
    document.body.appendChild(ul);
  }
  setTimeout(() => location.reload(), 30000);
}
