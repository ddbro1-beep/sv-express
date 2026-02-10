/**
 * HTML sanitization utilities to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param unsafe - The string that may contain HTML special characters
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }

  const str = String(unsafe);

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes HTML and preserves line breaks as <br> tags
 * @param unsafe - The string that may contain HTML special characters
 * @returns The escaped string with line breaks converted to <br>
 */
export function escapeHtmlWithBreaks(unsafe: unknown): string {
  return escapeHtml(unsafe).replace(/\n/g, '<br>');
}
