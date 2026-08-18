import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// PDFs live outside /public so they can only be reached through the
// token-gated /download/[token] route. Cover images live under /public
// since they're meant to be shown on the storefront.
const PRODUCTS_DIR = path.join(process.cwd(), "storage", "products");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function safeExt(filename: string, fallback: string) {
  const ext = path.extname(filename).toLowerCase();
  return ext || fallback;
}

export async function savePdfFile(file: File) {
  await mkdir(PRODUCTS_DIR, { recursive: true });
  const ext = safeExt(file.name, ".pdf");
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(PRODUCTS_DIR, filename), buffer);
  return filename; // stored as Product.filePath
}

export async function saveCoverImage(file: File) {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = safeExt(file.name, ".jpg");
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`; // stored as Product.coverImage, served statically
}

export function resolveProductFilePath(filename: string) {
  return path.join(PRODUCTS_DIR, filename);
}
