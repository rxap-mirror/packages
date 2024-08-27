import {
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';

export interface AnyHttpErrorDialogData {
  method: string;
  body?: any;
  stack?: string;
  error: any | null;
  message: string;
  name: string;
  timestamp: number;
  /**
   * All response headers.
   */
  headers: Record<string, string[]>;
  /**
   * Response status code.
   */
  status: number;
  /**
   * Textual description of response status code, defaults to OK.
   *
   * Do not depend on this.
   */
  statusText: string;
  /**
   * URL of the resource retrieved, or null if not available.
   */
  url: string | null;
  /**
   * Whether the status code falls in the 2xx range.
   */
  ok: boolean;
  /**
   * Type of the response, narrowed to either the full response or the header.
   */
  type: HttpEventType.Response | HttpEventType.ResponseHeader;
}
