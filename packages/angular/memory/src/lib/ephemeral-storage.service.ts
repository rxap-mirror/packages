import { Injectable } from '@angular/core';
import { MockStorage } from './storage-utility';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class EphemeralStorageService extends StorageService {

  constructor() {
    super(new MockStorage());
  }

}
