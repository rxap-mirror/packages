/**
 * @jest-environment jsdom
 */
import { ClickOnLink } from './click-on-link';

describe('ClickOnLink', () => {
  it('creates, clicks and removes an anchor', () => {
    let clicked: HTMLAnchorElement | undefined;
    const spy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this;
      expect(document.body.contains(this)).toBe(true);
    });
    ClickOnLink('https://example.com/file', '_self', 'name.txt');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(clicked?.href).toBe('https://example.com/file');
    expect(clicked?.target).toBe('_self');
    expect(clicked?.download).toBe('name.txt');
    expect(document.body.contains(clicked!)).toBe(false);
    spy.mockRestore();
  });

  it('defaults to _blank without download', () => {
    let clicked: HTMLAnchorElement | undefined;
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this;
    });
    ClickOnLink('https://example.com/');
    expect(clicked?.target).toBe('_blank');
    expect(clicked?.hasAttribute('download')).toBe(false);
  });
});
