export interface StatusControllerHealthCheckResponse {
  status: 'error' | 'ok' | 'shutting_down';
  info?: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
  error?: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
  details: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
}
