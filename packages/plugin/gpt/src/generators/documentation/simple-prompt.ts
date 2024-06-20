import { encode } from 'gpt-3-encoder';
import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

const tokenLimits = {
  'gpt-4-4o': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-4': 8192,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384,
};

export type Model = 'whisper-1' | 'dall-e-2' | 'gpt-3.5-turbo-16k' | 'tts-1-hd-1106' | 'tts-1-hd' | 'gpt-4-turbo-2024-04-09' | 'gpt-4-0125-preview' | 'gpt-4-turbo-preview' | 'gpt-4-turbo' | 'gpt-3.5-turbo-instruct-0914' | 'gpt-4o' | 'gpt-3.5-turbo-instruct' | 'text-embedding-3-small' | 'tts-1' | 'gpt-4' | 'text-embedding-3-large' | 'gpt-4-1106-preview' | 'babbage-002' | 'gpt-4-0613' | 'gpt-3.5-turbo-0125' | 'tts-1-1106' | 'dall-e-3' | 'text-embedding-ada-002' | 'davinci-002' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-1106' | 'gpt-4o-2024-05-13';

export interface SimplePromptOptions {
  max_tokens?: number,
  model?: Model,
}

export function IsAllDefined(options: SimplePromptOptions): options is Required<SimplePromptOptions> {
  return options.max_tokens !== undefined && options.model !== undefined;
}

export function AssertAllDefined(options: SimplePromptOptions): asserts options is Required<SimplePromptOptions> {
  if (!IsAllDefined(options)) {
    throw new Error(`\x1b[31mOptions are not all defined\x1b[0m`);
  }
}

export async function SimplePrompt(
  systemPrompt: string,
  prompt: string,
  openai: OpenAI,
  options: Partial<ChatCompletionCreateParamsBase> = {
    max_tokens: 1024,
    model: 'gpt-4-turbo',
  },
) {

  const systemPromptLength = encode(systemPrompt).length;
  const promptLength = encode(prompt).length;

  const inputLength = Math.floor((systemPromptLength + promptLength) * 1.1);

  options.model ??= 'gpt-4o';
  options.max_tokens ??= 1024;

  if (!tokenLimits[options.model]) {
    throw new Error(`\x1b[31mModel '${ options.model }' is not supported.\x1b[0m`);
  }

  const tokenLimit = tokenLimits[options.model];

  if (inputLength > tokenLimit * 0.8) {
    throw new Error(`\x1b[31mInput length (${ inputLength }) is too large. It should be at most ${ tokenLimit *
    0.8 }\x1b[0m`);
  }

  if (options.max_tokens) {
    if (options.max_tokens > tokenLimit - inputLength) {
      console.log(`\x1b[33mWarning: max_tokens (${ options.max_tokens }) is too large. It should be at most ${ tokenLimit -
      inputLength }\x1b[0m`);
      options.max_tokens = tokenLimit - inputLength;
    }
  }

  let content: string | undefined;

  try {
    const response = await openai.chat.completions.create({
      max_tokens: options.max_tokens,
      model: options.model,
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
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    content = response.choices[0].message?.content;

  } catch (e) {
    console.log(e.response?.data);
    throw new Error('OpenAI API error: ' + e.message);
  }

  if (!content) {
    throw new Error(`\x1b[31mNo content in response for paper\x1b[0m`);
  }

  return content;

}
