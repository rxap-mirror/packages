import { Environment } from './environment';
import { RXAP_ENVIRONMENT } from './environment/tokens';

export function ProvideEnvironment(environment: Environment) {
    return {
        provide: RXAP_ENVIRONMENT,
        useValue: environment,
    };
}
