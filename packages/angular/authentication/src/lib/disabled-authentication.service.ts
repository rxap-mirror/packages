import { Injectable } from '@angular/core';
import {
  EMPTY,
  of,
} from 'rxjs';
import { IAuthenticationService } from './authentication.service';

@Injectable()
export class DisabledAuthenticationService implements IAuthenticationService {

  public readonly isAuthenticated$ = of(true);
  public readonly events$ = EMPTY;

  async signOut() {
    console.log('Authentication is disabled. No sign out possible');
  }

  async isAuthenticated() {
    return true;
  }

}
