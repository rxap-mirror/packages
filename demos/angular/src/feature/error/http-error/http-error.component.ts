import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  interval,
  startWith,
  take,
  tap,
} from 'rxjs';

@Component({
  selector: 'rxap-http-error',
  standalone: true,
  imports: [ CommonModule, MatButtonModule ],
  templateUrl: './http-error.component.html',
  styleUrls: [ './http-error.component.scss' ],
})
export class HttpErrorComponent {

  private readonly http = inject(HttpClient);

  trigger404HttpError() {
    this.http.get('https://httpstat.us/404').subscribe();
  }

  triggerMultiple404HttpError() {
    interval(1000).pipe(
      startWith(0),
      take(10),
      tap(() => this.trigger404HttpError()),
    ).subscribe();
  }
}

export default HttpErrorComponent;
