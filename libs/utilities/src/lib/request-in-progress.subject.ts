import { toBoolean } from './rxjs/operators/to-boolean';
import { Observable } from 'rxjs';
import { CounterSubject } from './counter.subject';

export class RequestInProgressSubject extends CounterSubject {

  public loading$(): Observable<boolean> {
    return this.pipe(toBoolean());
  }

}
