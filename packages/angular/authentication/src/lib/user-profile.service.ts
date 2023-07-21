import { Injectable } from '@angular/core';

export interface RxapUserProfile {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  img?: string;
  language?: string;
  roleList?: string[];
}

@Injectable({ providedIn: 'root' })
export class RxapUserProfileService {

  profile: RxapUserProfile = {
    username: 'rxap',
    email: 'rxap@digitaix.dev',
    firstName: 'Rxap',
    lastName: 'DigitAIX',
    name: 'Rxap DigitAIX',
    img: 'icon.png',
    language: 'en',
    roleList: [ 'user.*', '*.edit' ],
  };

  async getProfile(): Promise<RxapUserProfile | null> {
    return { ...this.profile };
  }

  async setProfile(profile: RxapUserProfile): Promise<void> {
    this.profile = profile;
  }

  async setLanguage(language: string): Promise<void> {
    this.profile.language = language;
  }

  async getLanguage(): Promise<string | null> {
    return this.profile?.language ?? null;
  }

  async getRoleList(): Promise<string[]> {
    return this.profile.roleList ?? [];
  }

}
