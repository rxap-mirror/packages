import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { hasProperty } from '@rxap/utilities';

@Component({
  selector:        'rxap-documentation',
  templateUrl:     './documentation.component.html',
  styleUrls:       [ './documentation.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-documentation' }
})
export class DocumentationComponent {

  public tabs$: Observable<Record<string, string>>;

  constructor(private readonly route: ActivatedRoute) {
    this.tabs$ = this.route.data.pipe(
      hasProperty('tabs'),
      map(data => data.tabs)
    );
  }

}
