import { Subject } from 'rxjs';
import { CounterSubject } from './counter.subject';

export interface Method<ReturnType = any, Parameter = any> {
  executed$?: Subject<ReturnType>;
  destroyed$?: Subject<void>;
  initialised$?: Subject<void>;
  interceptors?: Set<Subject<any>>;
  executionsInProgress$?: CounterSubject;
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
