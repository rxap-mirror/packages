import { Injectable } from '@angular/core';
import { isBrowser } from './storage-utility';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageService extends StorageService {
  constructor() {
    super(isBrowser ? localStorage : null);
  }
}
