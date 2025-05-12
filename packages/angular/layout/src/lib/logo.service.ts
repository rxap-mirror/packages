import {
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  RXAP_LOGO_CONFIG,
  RXAP_LOGO_CONFIG_DEFAULTS,
} from './tokens';

@Injectable({ providedIn: 'root' })
export class LogoService {

  private readonly config = inject(ConfigService);
  public readonly logo = signal(
    inject(RXAP_LOGO_CONFIG, { optional: true }) ??
    this.config.get('logo', inject(RXAP_LOGO_CONFIG_DEFAULTS, { optional: true }) ?? {
      src: 'logo.png',
      width: 192,
    }),
  );

  public readonly src = computed(() => this.logo().src);
  public readonly width = computed(() => this.logo().width);
  public readonly height = computed(() => this.logo().height);

}
