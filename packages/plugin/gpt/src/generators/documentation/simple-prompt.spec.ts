import {
  AssertAllDefined,
  IsAllDefined,
  SimplePrompt,
} from './simple-prompt';

jest.mock('tiktoken', () => ({
  encoding_for_model: jest.fn(() => ({
    encode: (text: string) => ({ length: text.length }),
    free: jest.fn(),
  })),
}));

describe('SimplePrompt', () => {

  const create = jest.fn();
  const openai: any = { chat: { completions: { create } } };

  beforeEach(() => {
    create.mockReset().mockResolvedValue({ choices: [ { message: { content: 'result' } } ] });
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should check defined options', () => {
    expect(IsAllDefined({})).toBe(false);
    expect(IsAllDefined({ max_tokens: 1, model: 'o1' })).toBe(true);
    expect(() => AssertAllDefined({})).toThrow('Options are not all defined');
    expect(() => AssertAllDefined({ max_tokens: 1, model: 'o1' })).not.toThrow();
  });

  it('should return the response content using max_completion_tokens for o-models', async () => {
    expect(await SimplePrompt('sys', 'prompt', openai)).toBe('result');
    const input = create.mock.calls[0][0];
    expect(input.model).toBe('o3-mini');
    expect(input.max_completion_tokens).toBe(10000);
    expect(input.messages).toEqual([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'prompt' },
    ]);
  });

  it('should use max_tokens for gpt models', async () => {
    await SimplePrompt('sys', 'prompt', openai, { model: 'gpt-4o', max_tokens: 5 });
    expect(create.mock.calls[0][0].max_tokens).toBe(5);
  });

  it('should not set a token limit when max_tokens is missing', async () => {
    await SimplePrompt('sys', 'prompt', openai, { model: 'gpt-4o' });
    expect(create.mock.calls[0][0].max_tokens).toBeUndefined();
  });

  it('should reduce an oversized max_tokens', async () => {
    await SimplePrompt('sys', 'prompt', openai, { model: 'gpt-4o', max_tokens: 1_000_000 });
    expect(create.mock.calls[0][0].max_tokens).toBe(128_000 - 9);
  });

  it('should throw for unsupported models', async () => {
    await expect(SimplePrompt('s', 'p', openai, { model: 'unknown' as any })).rejects.toThrow('not supported');
  });

  it('should throw if the input is too large', async () => {
    await expect(SimplePrompt('s', 'x'.repeat(200_000), openai, { model: 'gpt-4o' })).rejects.toThrow('too large');
  });

  it('should throw if the response has no content', async () => {
    create.mockResolvedValue({ choices: [ { message: { content: '' } } ] });
    await expect(SimplePrompt('s', 'p', openai)).rejects.toThrow('No content in response');
  });

});
