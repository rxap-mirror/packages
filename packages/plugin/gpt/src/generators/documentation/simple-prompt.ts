import { OpenAIApi } from 'openai';
import { encode } from 'gpt-3-encoder';

const tokenLimits = {
  'gpt-4': 8192,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384,
};

export interface SimplePromtOptions {
  max_tokens?: number,
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k',
}

export async function SimplePrompt(
  systemPrompt: string,
  prompt: string,
  openai: OpenAIApi,
  options: SimplePromtOptions = {
    max_tokens: 1024,
    model: 'gpt-4',
  },
) {


  const systemPromptLength = encode(systemPrompt).length;
  const promptLength = encode(prompt).length;

  const inputLength = Math.floor((systemPromptLength + promptLength) * 1.1);

  options.model ??= 'gpt-4';
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
    const response = await openai.createChatCompletion({
      ...(options as any),
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

    content = response.data.choices[0].message?.content;

  } catch (e) {
    console.log(e.response?.data);
    throw new Error('OpenAI API error: ' + e.message);
  }

  if (!content) {
    throw new Error(`\x1b[31mNo content in response for paper\x1b[0m`);
  }

  return content;

}
