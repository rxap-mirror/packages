import { InjectionToken } from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs';
import { SubscriptionHandler } from '@rxap/utilities';
import { ErrorStateMatcher } from '@angular/material/core';

export const JSON_VIEW_IGNORED_PROPERTIES = new InjectionToken('rxap/form-system/inspector/ignored-properties', {
  providedIn: 'root',
  factory:    () => [
    '_subscriptions',
    'subscriptions',
    'injector',
    /\$$/
  ]
});

export const JSON_VIEW_IGNORED_TYPES = new InjectionToken('rxap/form-system/inspector/ignored-types', {
  providedIn: 'root',
  factory:    () => [
    Observable,
    Promise,
    Subscription,
    SubscriptionHandler,
    ErrorStateMatcher
  ]
});
