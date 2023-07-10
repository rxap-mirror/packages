import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  username: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email: string;
  photoURL?: string;
  avatarUrl?: string;
}

@Injectable({providedIn: 'root'})
/* ignore coverage */
export class UserService<User extends UserProfile = UserProfile> {

  public user$ = new BehaviorSubject<User | null>(null);

}
