export interface HealthControllerHealthCheckResponse {
  status?: string;
  info?: Record<string, {
    status?: string;
  } & Record<string, string>>;
  error?: Record<string, {
    status?: string;
  } & Record<string, string>>;
  details?: Record<string, {
    status?: string;
  } & Record<string, string>>;
}
