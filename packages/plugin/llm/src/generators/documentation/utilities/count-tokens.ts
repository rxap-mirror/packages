import { encoding_for_model } from 'tiktoken';
import { Model } from './model';

export function countTokens(model: Model, prompt: string): number {

  const enc = encoding_for_model(model);
  const count = enc.encode(prompt).length;
  enc.free();

  return count;

}
