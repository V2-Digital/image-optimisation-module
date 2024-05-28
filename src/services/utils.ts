/**
 * Determines if the given image path is an external URL.
 *
 * @param {string} imagePath - The path or URL of the image to check.
 * @returns {boolean} - Returns true if the image path is an external URL, otherwise false.
 */
export const isExternalUrl = (imagePath: string): boolean => {
  return imagePath.startsWith('http');
};
