import { redactSecrets } from './redact';

describe('redactSecrets', () => {
  it('masks the password of a redis url', () => {
    expect(redactSecrets('x redis://user:s3cret@host:6379/0 y')).toBe(
      'x redis://user:***@host:6379/0 y'
    );
  });

  it('masks the password of a rediss url without user', () => {
    expect(redactSecrets('rediss://:s3cret@host')).toBe('rediss://:***@host');
  });

  it('masks every occurrence', () => {
    expect(redactSecrets('redis://:a@h redis://:b@h')).toBe(
      'redis://:***@h redis://:***@h'
    );
  });

  it('masks explicitly passed secrets', () => {
    expect(redactSecrets('AUTH failed for hunter2', ['hunter2'])).toBe(
      'AUTH failed for ***'
    );
  });

  it('ignores empty or undefined secrets', () => {
    expect(redactSecrets('plain', ['', undefined])).toBe('plain');
  });

  it('leaves messages without secrets untouched', () => {
    expect(redactSecrets('ECONNREFUSED 127.0.0.1:6379')).toBe(
      'ECONNREFUSED 127.0.0.1:6379'
    );
  });
});
