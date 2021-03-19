import {
  Subject,
  Observable
} from 'rxjs';
import { CounterSubject } from './counter.subject';

export interface Method<ReturnType = any, Parameter = any> {
  executed$?: Observable<ReturnType>;
  destroyed$?: Observable<void>;
  initialised$?: Observable<void>;
  interceptors?: Set<Observable<any>>;
  executionsInProgress$?: Observable<number>;
  metadata?: any;

  call(parameters?: Parameter, ...args: any[]): Promise<ReturnType> | ReturnType;
}

export function ToMethod<ReturnType = any, Parameter = any>(call: ((
  parameters?: Parameter,
  ...args: any[]
) => Promise<ReturnType> | ReturnType)): Method<ReturnType, Parameter> {
  return {
    call,
    destroyed$: new Subject<void>(),
    initialised$: new Subject<void>(),
    interceptors: new Set<Subject<any>>(),
    executed$: new Subject<ReturnType>(),
    executionsInProgress$: new CounterSubject(),
    metadata: {},
  };
}
