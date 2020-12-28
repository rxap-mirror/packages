import {
  Subject,
  Observable
} from 'rxjs';
import { CounterSubject } from './counter.subject';

export interface Method<ReturnType = any, Parameter = any> {
  executed$?: Subject<ReturnType>;
  executionsInProgress$?: CounterSubject;
  metadata?: any;

  call(parameters?: Parameter, ...args: any[]): Promise<ReturnType> | Observable<ReturnType> | ReturnType;
}

export function ToMethod<ReturnType = any, Parameter = any>(call: ((
  parameters?: Parameter,
  ...args: any[]
) => Promise<ReturnType> | ReturnType)): Method<ReturnType, Parameter> {
  return { call };
}
