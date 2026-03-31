import { HttpContextToken } from '@angular/common/http';

export const OPEN_API_OPERATION_ID = new HttpContextToken<string>(() => '');
export const OPEN_API_SERVER_ID = new HttpContextToken<string | null>(() => null);
export const OPEN_API_SERVER_INDEX = new HttpContextToken<number>(() => 0);
export const OPEN_API_OPERATION = new HttpContextToken<string>(() => '');
