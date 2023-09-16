import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';

export interface StatusControllerHealthCheckParameter {
  service: Array<string>;
}

export interface StatusControllerHealthCheckResponse {
  status: 'error' | 'ok' | 'shutting_down';
  info?: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
  error?: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
  details: Record<string, {
    status: 'up' | 'down';
  } & Record<string, string>>;
}

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheck',
  operation: `{
  "operationId": "StatusController_healthCheck",
  "parameters": [
    {
      "name": "service",
      "required": true,
      "in": "query",
      "schema": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    }
  ],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "status": {
                "type": "string"
              },
              "info": {
                "type": "object",
                "additionalProperties": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": {
                    "type": "string"
                  }
                },
                "nullable": true
              },
              "error": {
                "type": "object",
                "additionalProperties": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": {
                    "type": "string"
                  }
                },
                "nullable": true
              },
              "details": {
                "type": "object",
                "additionalProperties": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/many"
}`,
})
export class StatusControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerHealthCheckResponse, StatusControllerHealthCheckParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>): Promise<StatusControllerHealthCheckResponse> {
    return super.call(parameters);
  }
}
