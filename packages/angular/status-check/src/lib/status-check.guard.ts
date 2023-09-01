import {
  inject,
  isDevMode,
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import {
  firstValueFrom,
  skip,
} from 'rxjs';
import { StatusCheckService } from './status-check.service';

export const StatusCheckGuard = async (route: ActivatedRouteSnapshot) => {

  const statusCheckService = inject(StatusCheckService);
  const router = inject(Router);

  const statusCheck: { services?: string[] } = route.data['statusCheck'];

  const url = '/' + route.url.join('/');

  if (!statusCheck || !statusCheck.services) {
    if (isDevMode()) {
      console.log(`No status check services defined in route data: ${ url }`);
    }
    return true;
  }

  if (isDevMode()) {
    console.log(`Status check: ${ url } for services: ${ statusCheck.services.join(', ') }`);
  }

  const status = await firstValueFrom(statusCheckService.getStatus(statusCheck.services).pipe(skip(1)));

  if (status.status === 'ok') {
    if (isDevMode()) {
      console.log(`Status check OK: ${ url } for services: ${ statusCheck.services.join(', ') }`);
    }
    return true;
  }

  console.error(`Status check failed: ${ url } for services: ${ statusCheck.services.join(', ') }`);

  return router.createUrlTree(
    [ '/', 'status-check' ],
    {
      queryParams: {
        url,
        service: statusCheck.services,
      },
    },
  );

};
