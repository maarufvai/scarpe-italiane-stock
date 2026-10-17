// Shrinks phone photos in the browser before upload, so uploads are fast on mobile
// data and stay well under the host's request size limit. Product cards and the
// detail page never show images larger than ~2000px, so nothing visible is lost.

const MAX_SIDE = 2000;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 800 * 1024; // small files are uploaded as-is

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * Returns a smaller JPEG/WebP version of the image, or the original file when it is
 * already small, is a GIF (may be animated), or the browser can't process it.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    // Applies EXIF rotation, so portrait phone photos stay upright
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // PNG/WebP may have transparency (the server trims around it) — keep it with WebP.
    // Browsers that can't encode WebP return PNG instead; then the original is safer.
    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    const type = keepAlpha ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, type);
    if (!blob || blob.type !== type || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? ".webp" : ".jpg");
    return new File([blob], name, { type, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}
