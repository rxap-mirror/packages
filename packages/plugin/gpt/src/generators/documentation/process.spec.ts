import { CreateProject } from '@rxap/ts-morph';
import { processClass } from './process-class';
import { processFunction } from './process-function';
import { processMethod } from './process-method';
import { processSourceFile } from './process-source-file';
import { prompt } from './prompt';

jest.mock('./prompt', () => ({ prompt: jest.fn() }));

describe('gpt documentation process functions', () => {

  const promptMock = prompt as jest.Mock;

  beforeEach(() => {
    promptMock.mockReset().mockResolvedValue('/**\n * Generated doc\n */');
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  function create(text: string) {
    return CreateProject().createSourceFile('a.ts', text);
  }

  it('should document functions without js doc', async () => {
    const fn = create('export function a() {}').getFunctions()[0];
    await processFunction({}, fn);
    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(fn.getJsDocs()).toHaveLength(1);
  });

  it('should skip functions with js doc', async () => {
    const fn = create('/** doc */\nexport function a() {}').getFunctions()[0];
    await processFunction({}, fn);
    expect(promptMock).not.toHaveBeenCalled();
  });

  it('should swallow errors for functions', async () => {
    promptMock.mockRejectedValue(new Error('boom'));
    const fn = create('export function a() {}').getFunctions()[0];
    await expect(processFunction({}, fn)).resolves.toBeUndefined();
    expect(fn.getJsDocs()).toHaveLength(0);
  });

  it('should document methods and swallow errors', async () => {
    const cls = create('export class A {\n  m() {}\n  n() {}\n  /** doc */\n  o() {}\n}').getClasses()[0];
    await processClass({}, cls);
    expect(promptMock).toHaveBeenCalledTimes(2);
    expect(cls.getMethods()[0].getJsDocs()).toHaveLength(1);
    promptMock.mockRejectedValue(new Error('boom'));
    await expect(processMethod({}, cls.getMethods()[2])).resolves.toBeUndefined();
    const fresh = create('export class B { m() {} }').getClasses()[0].getMethods()[0];
    await processMethod({}, fresh);
  });

  it('should process every function of a source file', async () => {
    const sf = create('export function a() {}\nexport function b() {}');
    await processSourceFile({}, sf);
    expect(promptMock).toHaveBeenCalledTimes(2);
  });

});
