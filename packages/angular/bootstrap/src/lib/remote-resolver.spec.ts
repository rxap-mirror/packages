import {
  getRemoteUrl,
  setRemoteDefinitions,
  setRemoteUrlResolver,
} from './remote-resolver';

describe('remote-resolver', () => {
  it('prefers registered definitions over the url resolver', () => {
    setRemoteUrlResolver((name) => `http://resolver/${name}`);
    setRemoteDefinitions({ a: 'http://a' });
    expect(getRemoteUrl('a')).toBe('http://a');
    expect(getRemoteUrl('b')).toBe('http://resolver/b');
  });

  it('throws if the remote can not be resolved', () => {
    setRemoteDefinitions({});
    setRemoteUrlResolver(() => '');
    expect(() => getRemoteUrl('x')).toThrow(/'x'/);
  });
});
