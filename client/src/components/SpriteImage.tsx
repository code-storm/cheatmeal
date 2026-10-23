import { parseSpriteImageUrl, spriteBackgroundStyle } from "../utils/spriteImage";

interface SpriteImageProps {
  url: string;
  alt: string;
  className?: string;
  size: number;
}

/**
 * Renders a reward/badge's imageUrl, transparently handling both plain
 * image URLs (a normal <img>) and sprite-sheet-encoded URLs (a cropped
 * region of client/public/events/tokidoki/sprite.png, via
 * background-position/-size) - see utils/spriteImage.ts for the encoding.
 * Callers don't need to know which kind of URL they were given.
 */
export function SpriteImage({ url, alt, className, size }: SpriteImageProps) {
  const sprite = parseSpriteImageUrl(url);
  if (!sprite) {
    return <img src={url} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <span
      role="img"
      aria-label={alt}
      className={className}
      style={{ ...spriteBackgroundStyle(url, size, size), display: "inline-block", width: size, height: size }}
    />
  );
}
