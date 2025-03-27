import { HttpContextToken } from '@angular/common/http';

export const OPEN_API_OPERATION_ID = new HttpContextToken<string>(() => '');
export const OPEN_API_SERVER_ID = new HttpContextToken<string>(() => '');
export const OPEN_API_OPERATION = new HttpContextToken<string>(() => '');
