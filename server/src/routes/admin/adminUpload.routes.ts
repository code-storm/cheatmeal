import path from "path";
import fs from "fs";
import { Router } from "express";
import multer from "multer";
import { requireAdminAuth } from "../../middleware/requireAdminAuth";

const router = Router();

router.use(requireAdminAuth);

// LOCAL-DEV-ONLY: writes directly onto the filesystem, reaching across
// from server/ to the sibling client/ directory so Vite serves the
// result as a static public asset - exactly how every existing event
// image (client/public/events/tokidoki/*) got there, just automated
// instead of manual. This assumes server and client are checked out as
// siblings on the same filesystem, which is true in local dev but almost
// certainly NOT true in production: Render only deploys server/
// (rootDir: server in render.yaml) and the client is a separately-built
// static site on Vercel - they share no filesystem at all. There is no
// prod-safe path here without moving to real object storage (S3/R2),
// which is explicitly out of scope for this version. In production,
// content authors still commit art to the client repo by hand and
// reference its path, same as today's Tokidoki assets - this endpoint
// will fail outright if ever called against the deployed server.
const UPLOAD_ROOT = path.resolve(__dirname, "../../../../client/public/events");

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeThemeSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(trimmed)) return null;
  return trimmed;
}

function slugifyFilename(originalName: string): string {
  const { name, ext } = path.parse(originalName);
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "upload"}-${Date.now()}${ext.toLowerCase()}`;
}

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const themeSlug = sanitizeThemeSlug(req.body?.themeSlug) ?? "evergreen";
    const dest = path.join(UPLOAD_ROOT, themeSlug);
    fs.mkdirSync(dest, { recursive: true });
    callback(null, dest);
  },
  filename: (_req, file, callback) => {
    callback(null, slugifyFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error("Only PNG, JPEG, WEBP, or GIF images are allowed."));
      return;
    }
    callback(null, true);
  },
});

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5MB)." : `Upload failed: ${err.message}`;
      res.status(400).json({ error: message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file was uploaded (expected a 'file' field)." });
      return;
    }

    const themeSlug = sanitizeThemeSlug(req.body?.themeSlug) ?? "evergreen";
    const url = `/events/${themeSlug}/${req.file.filename}`;
    res.status(201).json({ url });
  });
});

export default router;
