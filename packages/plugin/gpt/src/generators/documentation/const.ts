import { loadSystemPrompt } from './load-system-prompt';

export const FUNCTION_SYSTEM_PROMPT = loadSystemPrompt('function');
export const METHOD_SYSTEM_PROMPT = loadSystemPrompt('method');
const CLASS_SYSTEM_PROMPT = loadSystemPrompt('class');
export const MAX_TIME = 1000 * 60 * 60 * 0.5;
