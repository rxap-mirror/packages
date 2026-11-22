import { HandlebarsPipe } from './handlebars.pipe';

describe('HandlebarsPipe', () => {
  const pipe = new HandlebarsPipe();

  it('renders the template with the context', () => {
    expect(pipe.transform('Hello {{context.name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('renders missing values as empty', () => {
    expect(pipe.transform('a{{context.x}}b', {})).toBe('ab');
  });

  it('supports helpers like each/if', () => {
    expect(pipe.transform('{{#each context.items}}{{this}},{{/each}}', { items: [1, 2] })).toBe('1,2,');
    expect(pipe.transform('{{#if context.a}}yes{{else}}no{{/if}}', { a: false })).toBe('no');
  });

  it('works as pipe in a template', () => {
    // plain string passthrough
    expect(pipe.transform('static', undefined)).toBe('static');
  });
});
