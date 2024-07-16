import { ImageTypes } from './constants';

export const detectImageFormat = (
  buffer: Buffer,
  fallbackContentType: string | undefined,
): ImageTypes | undefined => {
  if ([0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b)) {
    return ImageTypes.jpeg;
  }
  if (
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (b, i) => buffer[i] === b,
    )
  ) {
    return ImageTypes.png;
  }
  if ([0x47, 0x49, 0x46, 0x38].every((b, i) => buffer[i] === b)) {
    return ImageTypes.gif;
  }
  if (
    [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every(
      (b, i) => !b || buffer[i] === b,
    )
  ) {
    return ImageTypes.webp;
  }
  if ([0x3c, 0x3f, 0x78, 0x6d, 0x6c].every((b, i) => buffer[i] === b)) {
    return ImageTypes['svg+xml'];
  }
  if ([0x3c, 0x73, 0x76, 0x67].every((b, i) => buffer[i] === b)) {
    return ImageTypes['svg+xml'];
  }
  if (
    [0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every(
      (b, i) => !b || buffer[i] === b,
    )
  ) {
    return ImageTypes.avif;
  }

  if (Object.values(ImageTypes).includes(fallbackContentType as ImageTypes)) {
    return fallbackContentType as ImageTypes;
  }

  return undefined;
};
