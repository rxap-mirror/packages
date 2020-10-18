import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpParams
} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AvatarImageService {

  public get({ name }: { name: string }): string {
    return new HttpRequest(
      'GET',
      'https://eu.ui-avatars.com/api',
      {
        params: new HttpParams({ fromObject: { name } })
      }
    ).urlWithParams;
  }

}
