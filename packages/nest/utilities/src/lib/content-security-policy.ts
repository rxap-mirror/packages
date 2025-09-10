import { Response } from 'express';
import { CoerceSuffix } from '@rxap/utilities';

export interface ContentSecurityPolicyOptions {
  reportUri?: string;
  auth0IssueUrl?: string;
  minioEndPoint?: string;
  csp?: Record<string, string[]>;
}

export interface SetHeadersOptions {
  contentSecurityPolicy?: string;
  reportUri?: string;
}

// End the host-source with `/` so that all paths are matched
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#host-source

export const CSP_DEFAULTS = {
  'default-src': ["'self'"],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com/',
  ],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://cdn.tailwindcss.com/',
    'https://*.posthog.com/',
    'https://browser.sentry-cdn.com/',
  ],
  'connect-src': [
    "'self'",
  ],
  'frame-src': ["'self'", 'https://*.sentry.io/'],
  'img-src': [
    "'self'",
    'blob:',
    'data:',
    'https://placehold.co/',
    'https://*.googleusercontent.com/',
    'https://ui-avatars.com/',
    'https://s.gravatar.com/',
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com/'],
  'object-src': ["'none'"],
  'media-src': ["'none'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'child-src': ["'self'", 'blob:'],
};

export function defaultSetHeaders({ contentSecurityPolicy, reportUri }: SetHeadersOptions = {}) {
  return (res: Response) => {
    if (contentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', contentSecurityPolicy);
    }
    res.setHeader('Document-Policy', 'js-profiling');
    if (reportUri) {
      // Source : https://docs.sentry.io/platforms/javascript/guides/angular/security-policy-reporting/
      res.setHeader(
        'Report-To',
        JSON.stringify({
          group: 'csp-endpoint',
          max_age: 10886400,
          endpoints: [
            {
              url: reportUri,
            },
          ],
          include_subdomains: true,
        })
      );
      res.setHeader('Reporting-Endpoints', `csp-endpoint="${reportUri}"`);
    }
  };
}

export function buildContentSecurityPolicy({ reportUri, auth0IssueUrl, minioEndPoint, csp = CSP_DEFAULTS }: ContentSecurityPolicyOptions = {}) {

  if (minioEndPoint) {
    csp['img-src'].push(`https://${minioEndPoint}/`);
  }

  if (auth0IssueUrl) {
    auth0IssueUrl = CoerceSuffix(auth0IssueUrl, '/');
    csp['frame-src'].push(auth0IssueUrl);
  }

  if (reportUri?.match(/^https?:\/\/([^/]+)/)) {
    // Source : https://docs.sentry.io/platforms/javascript/guides/angular/security-policy-reporting/
    csp['report-uri'] = [reportUri];
    csp['report-to'] = ['csp-endpoint'];
    csp['connect-src'].push(
      'https://' + reportUri.match(/^https?:\/\/([^/]+)/)![1] + '/'
    );
  }

  for (const [, rules] of Object.entries(csp).filter(([src]) => src !== 'connect-src')) {
    for (const rule of rules) {
      if (rule.startsWith('https://')) {
        const url = rule.split('?')[0].split('#')[0];
        if (!csp['connect-src'].includes(url)) {
          csp['connect-src'].push(url);
        }
      }
    }
  }

  return (
    Object.entries(csp)
      .map(([key, value]) => `${key} ${value.join(' ')}`)
      .join('; ') + ';'
  );
}
