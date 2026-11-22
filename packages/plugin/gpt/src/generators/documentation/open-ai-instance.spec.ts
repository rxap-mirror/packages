describe('open-ai-instance', () => {

  const list = jest.fn();

  function load() {
    jest.resetModules();
    jest.doMock('openai', () => ({ OpenAI: jest.fn(() => ({ models: { list } })) }));
    return require('./open-ai-instance');
  }

  beforeEach(() => {
    list.mockReset().mockResolvedValue({ data: [ { id: 'm1' } ] });
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should throw if the instance does not exist', () => {
    expect(() => load().getOpenAi()).toThrow('OpenAI instance is not created');
  });

  it('should create a singleton and list models', async () => {
    const mod = load();
    const instance = await mod.createOpenApi({ apiKey: 'k' });
    expect(mod.getOpenAi()).toBe(instance);
    expect(await mod.createOpenApi({ apiKey: 'other' })).toBe(instance);
    expect(list).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Models:', [ 'm1' ]);
  });

  it('should tolerate a failing model list', async () => {
    list.mockRejectedValue(new Error('x'));
    await load().createOpenApi({ apiKey: 'k' });
    expect(console.error).toHaveBeenCalledWith('Error listing models');
  });

});
