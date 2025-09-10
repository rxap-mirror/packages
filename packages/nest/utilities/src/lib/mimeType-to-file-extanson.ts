export function mimeTypeToFileExtension(mimeType: string): string;
export function mimeTypeToFileExtension(mimeType: string | undefined, defaultFileExtension: string): string;
export function mimeTypeToFileExtension(mimeType: string | undefined, defaultFileExtension?: string | undefined): string {
  const mimeTypeMap: { [key: string]: string } = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/vnd.microsoft.icon': '.ico',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/iirds+zip': '.iirds',
    'application/vnd.ms-excel': '.xls',
    'text/csv': '.csv',
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/javascript': '.js',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/markdown': '.md',
  };

  if (!mimeType) {
    return defaultFileExtension ?? '';
  }

  return mimeTypeMap[mimeType] ?? defaultFileExtension ?? '';
}
