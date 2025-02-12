import {
  encoding_for_model,
  TiktokenModel,
} from 'tiktoken';
import { Model } from './model';

export function countTokens(model: Model, prompt: string): number {

  let normalizedModel: TiktokenModel;
  if (model.startsWith('openai/')) {
    normalizedModel = model.replace(/openai\//, '') as TiktokenModel;
  } else {
    normalizedModel = 'gpt-4o';
  }
  const enc = encoding_for_model(normalizedModel);
  const count = enc.encode(prompt).length;
  enc.free();

  return count;

}
