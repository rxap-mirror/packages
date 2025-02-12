/**
 * Model Context size https://platform.openai.com/docs/models
 */
export const tokenLimits = {

  'anthropic/claude-3-5-sonnet': [200_000, 8192],
  'anthropic/claude-3-5-haiku': [200_000, 8192],
  'anthropic/claude-3-opus': [200_000, 4096],

  'gemini/2.0-flash': [1_000_000, 1_000_000], // $0.10 $0.40
  'gemini/1.5-flash': [128_000,128_000], // $0.075 $0.30
  'gemini/1.5-pro': [128_000,128_000], // $1.25 $5.00

  'openai/gpt-4o': [128_000], // $2.50 $10.00
  'openai/gpt-4o-mini': [128_000], // $0.15 $0.60
  'openai/o1': [200_000], // $15.00 $60.00
  'openai/o1-mini': [128_000], // $1.10 $4.40
  'openai/o3-mini': [200_000], // $1.10 $4.40

};
export type Model = keyof typeof tokenLimits;
