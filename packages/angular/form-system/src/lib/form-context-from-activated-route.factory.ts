import { ActivatedRoute } from '@angular/router';

export function FormContextFromActivatedRouteFactory(route: ActivatedRoute) {
  return route.snapshot.params;
}
