import { ReadAsDataURLPipe } from './read-as-data-url.pipe';

describe('ReadAsDataURLPipe', () => {
  const pipe = new ReadAsDataURLPipe();

  it('returns null for empty input', async () => {
    await expect(pipe.transform(null)).resolves.toBeNull();
  });

  it('converts a blob to a data url', async () => {
    const result = await pipe.transform(new Blob(['hello'], { type: 'text/plain' }));
    expect(result).toBe('data:text/plain;base64,' + btoa('hello'));
  });
});
