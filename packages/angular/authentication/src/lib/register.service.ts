import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
/* ignore coverage */
export class RegisterService {

  constructor() {
    console.warn('The default RegisterService implementation should only be used in a development environment!');
  }

  public register(email: string, password: string): Promise<boolean> {
    return Promise.resolve(true);
  }

}
