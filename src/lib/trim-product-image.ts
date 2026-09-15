import sharp from "sharp";

// Product photos often arrive with a large empty border around the shoe, which
// makes the shoe look tiny in the square product cards. Crop that border away,
// then pad back to a square with a small even margin so every photo is centered
// and fills the card consistently.

const MARGIN = 0.06; // empty space on each side, as a fraction of the shoe's longest edge
const TRIM_THRESHOLD = 20; // how different from the corner colour a pixel must be to count as "shoe"

const FORMATS = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

async function cornerColour(input: Buffer) {
  const [r, g, b] = await sharp(input)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .toColourspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer();
  return { r, g, b, alpha: 1 };
}

/**
 * Returns the trimmed, square-padded image in the same format as the input,
 * or null when the type isn't supported (e.g. animated GIF) or processing fails,
 * in which case the caller should keep the original.
 */
export async function trimProductImage(input: Buffer, contentType: string): Promise<Buffer | null> {
  const format = FORMATS[contentType as keyof typeof FORMATS];
  if (!format) return null;

  try {
    // Apply EXIF orientation first so phone photos are trimmed the right way up.
    const oriented = await sharp(input).rotate().toBuffer();
    const { data, info } = await sharp(oriented)
      .trim({ threshold: TRIM_THRESHOLD })
      .png()
      .toBuffer({ resolveWithObject: true });

    const side = Math.round(Math.max(info.width, info.height) * (1 + MARGIN * 2));
    const padX = side - info.width;
    const padY = side - info.height;
    const background =
      info.channels === 4 ? { r: 0, g: 0, b: 0, alpha: 0 } : await cornerColour(oriented);

    return await sharp(data)
      .extend({
        top: Math.floor(padY / 2),
        bottom: Math.ceil(padY / 2),
        left: Math.floor(padX / 2),
        right: Math.ceil(padX / 2),
        background,
      })
      .toFormat(format, format === "jpeg" ? { quality: 90 } : undefined)
      .toBuffer();
  } catch (err) {
    console.error("trimProductImage failed, keeping original:", err);
    return null;
  }
}
