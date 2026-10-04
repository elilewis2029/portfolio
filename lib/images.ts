import "server-only";
import sharp from "sharp";
import exifr from "exifr";

export type Processed = {
  webp: Buffer;
  width: number;
  height: number;
  takenAt: Date | null;
  forModel: string; // base64 jpeg, 1024px long edge
};

/** Original -> 1600px webp for the site, 1024px jpeg for the model, EXIF date. */
export async function processImage(original: Buffer): Promise<Processed> {
  let takenAt: Date | null = null;
  try {
    const exif = await exifr.parse(original, ["DateTimeOriginal", "CreateDate"]);
    const d = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (d instanceof Date && !isNaN(+d)) takenAt = d;
  } catch {
    // no EXIF
  }
  const base = sharp(original, { failOn: "none" }).rotate(); // honour EXIF orientation
  const { data: webp, info } = await base.clone()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const forModel = await base.clone()
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return { webp, width: info.width, height: info.height, takenAt, forModel: forModel.toString("base64") };
}
