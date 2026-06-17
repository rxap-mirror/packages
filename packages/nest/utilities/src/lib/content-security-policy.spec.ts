import {
  buildContentSecurityPolicy,
  CSP_DEFAULTS,
} from './content-security-policy';

describe('buildContentSecurityPolicy', () => {

  it('should not mutate the shared CSP_DEFAULTS across invocations', () => {
    const imgSrcBefore = [ ...CSP_DEFAULTS['img-src'] ];
    const frameSrcBefore = [ ...CSP_DEFAULTS['frame-src'] ];

    buildContentSecurityPolicy({ minioEndPoint: 'minio.example.com', auth0IssueUrl: 'https://issuer.example.com' });
    buildContentSecurityPolicy({ minioEndPoint: 'minio.example.com', auth0IssueUrl: 'https://issuer.example.com' });

    expect(CSP_DEFAULTS['img-src']).toEqual(imgSrcBefore);
    expect(CSP_DEFAULTS['frame-src']).toEqual(frameSrcBefore);
  });

  it('should include the minio endpoint in img-src of the produced policy', () => {
    const csp = buildContentSecurityPolicy({ minioEndPoint: 'minio.example.com' });
    expect(csp).toContain('https://minio.example.com/');
  });

});
