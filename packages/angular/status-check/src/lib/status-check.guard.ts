import {
  inject,
  isDevMode,
} from '@angular/core';
import { Router } from '@angular/router';
import { StatusCheckService } from './status-check.service';

export const StatusCheckGuard = async (...args: any[]) => {

  console.log('args', args);

  const router = inject(Router);
  const statusCheckService = inject(StatusCheckService);

  if (isDevMode()) {
    return true;
  }


  const isHealthy = await statusCheckService.isHealthy();
  if (!isHealthy) {
    return router.createUrlTree([ '/', 'error', 'api-status' ]);
  }
  return true;

};
