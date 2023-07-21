export function ClickOnLink(url: string, target = '_blank', download?: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = target;
  if (download) {
    a.download = download;
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
