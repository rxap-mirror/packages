export const HealthIndicatorResultSchema = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: [ 'up', 'down' ],
      },
    },
    additionalProperties: {
      type: 'string',
    },
    required: [ 'status' ],
  },
};

export const HealthCheckStatusSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: [ 'error', 'ok', 'shutting_down' ],
    },
    info: HealthIndicatorResultSchema,
    error: HealthIndicatorResultSchema,
    details: HealthIndicatorResultSchema,
  },
  required: [ 'status', 'details' ],
};
