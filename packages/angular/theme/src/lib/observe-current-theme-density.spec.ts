import { ThemeDensity } from '@rxap/utilities';
import { ObserveCurrentThemeDensity } from './observe-current-theme-density';

const flush = () => new Promise<void>((r) => setTimeout(r));

describe('ObserveCurrentThemeDensity', () => {
  afterEach(() => (document.body.className = ''));

  it('emits the density derived from the body class and 0 when none', async () => {
    const values: ThemeDensity[] = [];
    const sub = ObserveCurrentThemeDensity().subscribe((v) => values.push(v));
    document.body.classList.add('density-2');
    await flush();
    document.body.className = 'other';
    await flush();
    document.body.className = 'density-1';
    await flush();
    sub.unsubscribe();
    expect(values).toEqual([-2, 0, -1]);
  });

  it('stops observing after unsubscribe', async () => {
    const values: ThemeDensity[] = [];
    ObserveCurrentThemeDensity().subscribe((v) => values.push(v)).unsubscribe();
    document.body.classList.add('density-3');
    await flush();
    expect(values).toEqual([]);
  });
});
