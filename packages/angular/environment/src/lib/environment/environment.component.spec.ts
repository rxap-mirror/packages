import { TestBed } from '@angular/core/testing';
import { Environment } from '../environment';
import { EnvironmentComponent } from './environment.component';
import { RXAP_ENVIRONMENT } from './tokens';

function render(environment: Environment) {
  TestBed.configureTestingModule({
    imports: [EnvironmentComponent],
    providers: [{ provide: RXAP_ENVIRONMENT, useValue: environment }],
  });
  const fixture = TestBed.createComponent(EnvironmentComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('EnvironmentComponent', () => {
  it('renders the minimal environment', () => {
    const el = render({ app: 'my-app', production: true });
    expect(el.querySelector('h2')?.textContent).toBe('my-app');
    expect(el.textContent).toContain('Production');
    expect(el.textContent).not.toContain('Branch');
    expect(el.textContent).not.toContain('Release');
  });

  it('renders the optional rows', () => {
    const el = render({
      app: 'a', production: false, name: 'dev', serviceWorker: false, release: 'r1',
      commit: 'c1', timestamp: 0, branch: 'main', tag: 'v1',
    });
    const text = el.textContent!;
    for (const label of ['Environment', 'Service Worker', 'Release', 'Commit', 'Branch', 'Tag']) {
      expect(text).toContain(label);
    }
  });
});
