import { RXAP_CONFIG } from './tokens';

export function ProvideConfig(config: Record<string, unknown> = {}) {
  return {
    provide: RXAP_CONFIG,
    useValue: config,
  };
}
