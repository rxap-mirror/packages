import { prompt } from './prompt';
import { getOpenAi } from './open-ai-instance';
import { SimplePrompt } from './simple-prompt';

jest.mock('./open-ai-instance', () => ({ getOpenAi: jest.fn(() => 'openai') }));
jest.mock('./simple-prompt', () => ({ SimplePrompt: jest.fn(async () => 'answer') }));

describe('prompt', () => {

  beforeEach(() => jest.spyOn(console, 'log').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('should return an empty string offline', async () => {
    expect(await prompt({ offline: true }, 'sys', 'p')).toBe('');
    expect(SimplePrompt).not.toHaveBeenCalled();
  });

  it('should delegate to SimplePrompt', async () => {
    expect(await prompt({}, 'sys', 'p')).toBe('answer');
    expect(SimplePrompt).toHaveBeenCalledWith('sys', 'p', 'openai');
    expect(getOpenAi).toHaveBeenCalled();
  });

});
