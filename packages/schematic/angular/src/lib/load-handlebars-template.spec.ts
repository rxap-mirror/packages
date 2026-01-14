import { LoadHandlebarsTemplate } from './load-handlebars-template';
import { existsSync, readFileSync } from 'fs';
import Handlebars from 'handlebars';

jest.mock('fs');
jest.mock('handlebars');

describe('LoadHandlebarsTemplate', () => {
  it('should compile direct template string if it does not end with .hbs', () => {
    (Handlebars.compile as jest.Mock).mockReturnValue('compiled');
    const result = LoadHandlebarsTemplate('template-string', 'base');
    expect(Handlebars.compile).toHaveBeenCalledWith('template-string');
    expect(result).toBe('compiled');
  });

  it('should load and compile template from file if it ends with .hbs', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (readFileSync as jest.Mock).mockReturnValue('file-content');
    (Handlebars.compile as jest.Mock).mockReturnValue('compiled');

    const result = LoadHandlebarsTemplate('test.hbs', '/base');

    expect(existsSync).toHaveBeenCalledWith('/base/test.hbs');
    expect(readFileSync).toHaveBeenCalledWith('/base/test.hbs', 'utf-8');
    expect(Handlebars.compile).toHaveBeenCalledWith('file-content');
    expect(result).toBe('compiled');
  });

  it('should throw if template file does not exist', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    expect(() => LoadHandlebarsTemplate('test.hbs', '/base')).toThrow('The template file "/base/test.hbs" does not exists');
  });
});
