/**
 * @jest-environment jsdom
 */
import { ObserveElementHeight } from './observe-element-height';

describe('ObserveElementHeight', () => {
  it('emits null, then the height when the element is added, and stops after unsubscribe', async () => {
    const parent = document.createElement('div');
    const values: Array<number | null> = [];
    const sub = ObserveElementHeight(parent, '.child').subscribe((v) => values.push(v));
    expect(values).toEqual([null]);

    const child = document.createElement('div');
    child.className = 'child';
    Object.defineProperty(child, 'clientHeight', { value: 42, configurable: true });
    parent.appendChild(child);
    await new Promise((r) => setTimeout(r));
    expect(values[values.length - 1]).toBe(42);

    sub.unsubscribe();
    const count = values.length;
    parent.appendChild(document.createElement('span'));
    await new Promise((r) => setTimeout(r));
    expect(values.length).toBe(count);
  });

  it('emits the initial height if the element exists', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    child.className = 'child';
    Object.defineProperty(child, 'clientHeight', { value: 10 });
    parent.appendChild(child);
    const values: Array<number | null> = [];
    ObserveElementHeight(parent, '.child').subscribe((v) => values.push(v)).unsubscribe();
    expect(values).toEqual([10]);
  });
});
