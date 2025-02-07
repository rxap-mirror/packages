import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/src/resources/chat/completions';
import { encoding_for_model } from 'tiktoken';
import 'colors';

/**
 * Model Context size https://platform.openai.com/docs/models
 */
const tokenLimits = {
  'gpt-4o': 128_000, // $2.50
  'gpt-4o-mini': 128_000, // $0.15
  'o1': 200_000, // $15.00
  'o1-mini': 128_000, // $1.10
  'o3-mini': 200_000, // $1.10
};

export type Model = keyof typeof tokenLimits;

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
  options: Partial<ChatCompletionCreateParamsBase> & { model: Model } = {
    model: 'o3-mini',
    max_tokens: 10_000
  },
) {

  const enc = encoding_for_model(options.model);

  const systemPromptLength = enc.encode(systemPrompt).length;
  const promptLength = enc.encode(prompt).length;

  enc.free();

  const inputLength = systemPromptLength + promptLength;

  options.model ??= 'o3-mini';

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

  let content: string | undefined = undefined;

  console.log(`send with '${promptLength}' prompt tokens and '${systemPromptLength}' system prompt tokens with '${options.max_tokens}' max tokens`.grey);
  const input: ChatCompletionCreateParamsNonStreaming = {
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
  };
  if (options.max_tokens) {
    if (options.model.startsWith('o')) {
      input.max_completion_tokens = options.max_tokens;
    } else {
      input.max_tokens = options.max_tokens;
    }
  }
  const response = await openai.chat.completions.create(input);

  content = response.choices[0].message?.content;

  if (!content) {
    console.log('No content in response'.red);
    throw new Error(`No content in response`);
  }

  return content;

}
