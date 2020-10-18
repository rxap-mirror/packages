export function GetWindowStartPos(): { top: string, left: string } {
  let top  = '16px';
  let left = '16px';

  // TODO : remove hack to get a better window starting position

  const rxapLayoutHeaderElements = document.getElementsByClassName('rxap-layout-header');

  if (rxapLayoutHeaderElements) {
    const rxapLayoutHeaderElement = rxapLayoutHeaderElements.item(0);
    if (rxapLayoutHeaderElement && rxapLayoutHeaderElement instanceof HTMLElement) {
      top = (rxapLayoutHeaderElement.offsetHeight + 16) + 'px';
    }
  }

  const rxapLayoutSidenavs = document.getElementsByClassName('rxap-layout-sidenav');

  if (rxapLayoutSidenavs) {
    const rxapLayoutSidenav = rxapLayoutSidenavs.item(0);
    if (rxapLayoutSidenav && rxapLayoutSidenav instanceof HTMLElement) {
      const container = rxapLayoutSidenav.firstElementChild;
      if (container && container instanceof HTMLElement) {
        left = (container.offsetWidth + 16) + 'px';
      }
    }
  }

  return { top, left };
}
