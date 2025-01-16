import { LogLevel } from '@nestjs/common';
import { PrintMessagesFunction } from '@rxap/nest-logger';
import { Environment } from '@rxap/nest-utilities';
import { DeleteEmptyProperties } from '@rxap/utilities';

/**
 * Sources
 * https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
 * https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
 * https://cloud.google.com/run/docs/logging#container-logs
 *
 * When you provide a structured log as a JSON dictionary, some special fields are stripped from the
 * jsonPayload and are written to the corresponding field in the generated LogEntry as described in the
 * documentation for special fields.
 * https://cloud.google.com/logging/docs/agent/logging/configuration#special-fields
 * @param level
 */

function logLevelToSeverity(level: LogLevel): string {
  switch (level) {
    case 'log':
      return 'INFO';
    case 'debug':
      return 'DEBUG';
    case 'warn':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    case 'fatal':
      return 'CRITICAL';
  }

  return 'DEFAULT';
}

function countOccurrences(mainStr: string, subStr: string) {
  let count = 0;
  let position = mainStr.indexOf(subStr);

  while (position !== -1) {
    count++;
    position = mainStr.indexOf(subStr, position + subStr.length);
  }

  return count;
}

export const googleLoggingPrintMessagesFactory: (environment: Environment) => PrintMessagesFunction = (environment: Environment) => (
  messages: unknown[],
  context: string,
  logLevel: LogLevel,
  writeStreamType?: 'stdout' | 'stderr'
) => {
  if (!messages.length) {
    return true;
  }

  const firstMessage = messages.shift();
  let message: string | undefined = undefined;
  let jsonPayload: Record<string, any> | undefined = undefined;
  if (typeof firstMessage === 'string') {
    if (context) {
      message = `[${context}] ${firstMessage}`;
    } else {
      message = firstMessage;
    }
    if (messages.length) {
      jsonPayload = {};
      if (firstMessage.includes('%JSON')) {
        const interpolateCount = countOccurrences(firstMessage, '%JSON');
        jsonPayload['interpolates'] = messages.splice(0, interpolateCount);
      }
      if (messages.length) {
        jsonPayload['args'] = messages;
      }
    }
  } else {
    if (messages.length === 1) {
      if (typeof messages[0] === 'object' && messages[0]) {
        if (!Array.isArray(messages[0])) {
          jsonPayload = messages[0];
        } else {
          jsonPayload = { items: messages[0] }
        }
      } else {
        message = JSON.stringify(messages[0]);
      }
    } else {
      jsonPayload = {messages};
    }
  }
  const payload: Record<string, any> = {
    message,
    ...jsonPayload,
    severity: logLevelToSeverity(logLevel),
  };
  const labels: Record<string, string> = DeleteEmptyProperties({
    app: environment.app,
    production: environment.production ? 'true' : 'false',
    release: environment.release,
    gitCommit: environment.commit,
    gitBranch: environment.branch,
    gitTag: environment.tag,
    buildTimestamp: environment.timestamp,
    environmentTier: environment.tier,
    environmentName: environment.name,
  }) as Record<string, string>;
  if (context) {
    labels['context'] = context;
  }
  if (Object.keys(labels).length) {
    payload["logging.googleapis.com/labels"] = labels;
  }
  console.log(JSON.stringify(payload));

  return false;
};
