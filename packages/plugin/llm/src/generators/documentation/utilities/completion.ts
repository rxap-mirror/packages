import * as process from 'node:process';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/src/resources/chat/completions';
import { assertTokenLimit } from './assert-token-limit';
import {
  Model,
  tokenLimits,
} from './model';
import 'colors';

export interface CompletionOptions {
  model?: Model,
  maxTokens?: number,
  baseUrl?: string;
  apiKey?: string;
  orgId?: string;
  projectId?: string;
}

export async function completion(
  systemPrompt: string,
  prompt: string,
  options: CompletionOptions = {}
) {

  const { model = 'openai/gpt-4o-mini', maxTokens = tokenLimits[model][1] } = options;

  assertTokenLimit(model, systemPrompt, prompt);

  const input: ChatCompletionCreateParamsNonStreaming = {
    model,
    messages: [
      {
        'role': 'system',
        'content': systemPrompt,
      },
      {
        'role': 'user',
        'content': prompt,
      },
    ],
    temperature: 0,
  };

  if (model.startsWith('o')) {
    input.max_completion_tokens = maxTokens;
  } else {
    input.max_tokens = maxTokens;
  }

  const response = await new OpenAI({
    apiKey: options.apiKey,
    project: options.projectId,
    organization: options.orgId,
    baseURL: options.baseUrl,
  }).chat.completions.create(input);

  const content = response.choices[0].message?.content;

  if (!content) {
    console.log('No content in response'.red);
    throw new Error(`No content in response`);
  }

  return content;

}
