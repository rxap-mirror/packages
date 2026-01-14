import { ToTitle } from './to-title';

describe('ToTitle', () => {
  it('should convert dasherized string to title case with spaces', () => {
    expect(ToTitle('my-dasherized-string')).toBe('My Dasherized String');
  });

  it('should handle single word', () => {
    expect(ToTitle('word')).toBe('Word');
  });

  it('should handle empty string', () => {
    expect(ToTitle('')).toBe('');
  });

  it('should handle strings that are already partially title case', () => {
    // dasherize will lowercase everything first
    expect(ToTitle('My-Dasherized-String')).toBe('My Dasherized String');
  });
});
