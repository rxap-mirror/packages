import { RXAP_CONFIG } from '@rxap/config';

export function ProvideConfig(config: Record<string, unknown> = {}) {
  return {
    provide: RXAP_CONFIG,
    useValue: config,
  };
}
