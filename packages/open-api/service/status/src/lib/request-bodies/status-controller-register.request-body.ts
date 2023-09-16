export interface StatusControllerRegisterRequestBody {
  name: string;
  url?: string;
  port?: number;
  healthCheckPath?: string;
  domain?: string;
  ip?: string;
  infoPath?: string;
  protocol?: string;
}
