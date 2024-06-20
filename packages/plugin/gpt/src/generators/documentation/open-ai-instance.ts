import { OpenAI } from 'openai';
import { ClientOptions } from 'openai/src';

let OPENAI_INSTANCE: OpenAI | null = null;

export async function createOpenApi(param: ClientOptions) {

  if (OPENAI_INSTANCE) {
    return OPENAI_INSTANCE;
  }

  OPENAI_INSTANCE = new OpenAI(param);

  await OPENAI_INSTANCE.models.list()
    .catch(() => console.error('Error listing models'))
    .then(models => {
      if (models) {
        console.log('Models:', models.data.map(model => model.id));
      }
    });

  return OPENAI_INSTANCE;

}

export function getOpenAi() {
  if (!OPENAI_INSTANCE) {
    throw new Error('OpenAI instance is not created');
  }
  return OPENAI_INSTANCE;
}
