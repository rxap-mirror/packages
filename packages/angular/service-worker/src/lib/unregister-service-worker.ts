import { Environment } from '@rxap/environment';

export function UnregisterServiceWorker(environment: Environment) {
  if (!environment.serviceWorker) {
    navigator?.serviceWorker?.getRegistrations().then(async (registrations) => {
      await Promise.all(registrations.map((registration) => {
        console.log('unregister service worker: ' + registration.scope);
        return registration.unregister();
      }));
      if (registrations.length) {
        const response = confirm(
          'All dangling service worker are unregistered. Should the application be reloaded to complete the migration');
        if (response) {
          location.reload();
        }
      }
    });
  }
}
