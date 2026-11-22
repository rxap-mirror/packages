import { completion } from './completion';

const create = jest.fn();
const OpenAIMock = jest.fn(() => ({ chat: { completions: { create } } }));

jest.mock('openai', () => ({ __esModule: true, default: function (...args: any[]) {
  return (OpenAIMock as any)(...args);
} }));
jest.mock('./assert-token-limit', () => ({ assertTokenLimit: jest.fn(() => 42) }));

describe('completion', () => {

  beforeEach(() => {
    create.mockReset().mockResolvedValue({ choices: [ { message: { content: 'answer' } } ] });
    OpenAIMock.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should use the default model with max_tokens', async () => {
    expect(await completion('sys', 'prompt')).toBe('answer');
    const input = create.mock.calls[0][0];
    expect(input.model).toBe('openai/gpt-4o-mini');
    expect(input.max_tokens).toBeUndefined();
    expect(input.messages).toHaveLength(2);
    expect(input.temperature).toBe(0);
  });

  it('should pass the client options and use max_tokens for non-o models', async () => {
    await completion('sys', 'prompt', {
      model: 'anthropic/claude-3-5-sonnet', apiKey: 'k', orgId: 'o', projectId: 'p', baseUrl: 'u',
    });
    expect(OpenAIMock).toHaveBeenCalledWith({ apiKey: 'k', organization: 'o', project: 'p', baseURL: 'u' });
    expect(create.mock.calls[0][0].max_tokens).toBe(8192);
  });

  it('should throw without content', async () => {
    create.mockResolvedValue({ choices: [ { message: { content: null } } ] });
    await expect(completion('s', 'p')).rejects.toThrow('No content in response');
  });

});
