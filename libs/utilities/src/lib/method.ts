import { Subject } from 'rxjs';
import { CounterSubject } from './counter.subject';

export interface Method<ReturnType = any, Parameter = any> {
  executed$?: Subject<ReturnType>;
  executionsInProgress$?: CounterSubject;
  metadata?: any;

  call(parameters?: Parameter): Promise<ReturnType> | ReturnType;
}
