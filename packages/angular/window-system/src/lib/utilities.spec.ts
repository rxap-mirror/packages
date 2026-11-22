import { GetWindowStartPos } from './utilities';

describe('GetWindowStartPos', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('defaults to 16px', () => {
    expect(GetWindowStartPos()).toEqual({ top: '16px', left: '16px' });
  });

  it('offsets by the layout header and sidenav', () => {
    document.body.innerHTML = `
      <div class="rxap-layout-header"></div>
      <div class="rxap-layout-sidenav"><div class="c"></div></div>`;
    const header = document.querySelector('.rxap-layout-header') as HTMLElement;
    const container = document.querySelector('.c') as HTMLElement;
    Object.defineProperty(header, 'offsetHeight', { value: 64 });
    Object.defineProperty(container, 'offsetWidth', { value: 200 });
    expect(GetWindowStartPos()).toEqual({ top: '80px', left: '216px' });
  });

  it('ignores a sidenav without a container', () => {
    document.body.innerHTML = '<div class="rxap-layout-sidenav"></div>';
    expect(GetWindowStartPos().left).toBe('16px');
  });
});
