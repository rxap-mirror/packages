import { Minio } from './Minio.credentials';

describe('Minio credentials', () => {
  it('declares the minio connection properties', () => {
    const credentials = new Minio();
    expect(credentials.name).toBe('minio');
    expect(credentials.properties.map((p) => p.name)).toEqual(['endPoint', 'port', 'useSSL', 'accessKey', 'secretKey']);
    expect(credentials.properties.find((p) => p.name === 'secretKey')!.typeOptions).toEqual({ password: true });
  });
});
