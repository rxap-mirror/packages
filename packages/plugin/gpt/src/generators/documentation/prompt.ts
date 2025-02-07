import { getOpenAi } from './open-ai-instance';
import { DocumentationGeneratorSchema } from './schema';
import { SimplePrompt } from './simple-prompt';

export async function prompt(options: DocumentationGeneratorSchema, systemPrompt: string, prompt: string) {

  if (options.offline) {
    console.log('Prompt:', prompt);
    return '';
  } else {
    return SimplePrompt(
      systemPrompt,
      prompt,
      getOpenAi(),
    );
  }
}
