import { getOpenAi } from './open-ai-instance';
import { SimplePrompt } from './simple-prompt';

export async function prompt(options, systemPrompt: string, prompt: string) {

  if (options.offline) {
    return '';
  }

  return SimplePrompt(
    systemPrompt,
    prompt,
    getOpenAi(),
  );
}
