import type { CSSProperties } from "react";

// Tokidoki event art ships as a single CSS sprite sheet
// (client/public/events/tokidoki/sprite.png, 1440x700 - a sheet of several
// character stickers) rather than one file per reward/badge. A reward's or
// badge's `imageUrl` encodes which region of that sheet to show as query
// params on the same URL - e.g.
// "/events/tokidoki/sprite.png?x=10&y=10&w=185&h=195" - so no schema change
// was needed (imageUrl stays a single String column) and the hero/card
// banner images can keep using the plain, un-cropped URL via a normal
// <img> tag.
//
// A plain <img> tag can't show just one region of a larger image, so
// per-character thumbnails (RewardCard/BadgeCard) render a sized <span>
// with this module's background-image/-position/-size instead - the
// classic CSS sprite technique, scaled to whatever box the caller needs.

export const TOKIDOKI_SPRITE_URL = "/events/tokidoki/sprite.png";

const SPRITE_NATURAL_WIDTH = 1440;
const SPRITE_NATURAL_HEIGHT = 700;

export interface SpriteRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Hand-picked crop boxes (pixel coordinates within sprite.png) for each
// character used across event content - see content/rewards.ts and
// content/badges.ts on the server for which region backs which item.
export const TOKIDOKI_SPRITE_REGIONS = {
  dinoGirl: { x: 10, y: 10, w: 185, h: 195 },
  skullStar: { x: 610, y: 45, w: 105, h: 125 },
  rainbowClouds: { x: 745, y: 170, w: 135, h: 105 },
  bearPanda: { x: 1265, y: 55, w: 155, h: 145 },
  donutGirl: { x: 695, y: 330, w: 180, h: 175 },
  rainbowCloudWave: { x: 10, y: 475, w: 235, h: 170 },
  starFace: { x: 295, y: 580, w: 130, h: 115 },
  blackSkullStar: { x: 1185, y: 410, w: 110, h: 140 },
  diamondCrystal: { x: 1295, y: 570, w: 110, h: 125 },
} as const satisfies Record<string, SpriteRegion>;

export function spriteImageUrl(region: SpriteRegion): string {
  const params = new URLSearchParams({
    x: String(region.x),
    y: String(region.y),
    w: String(region.w),
    h: String(region.h),
  });
  return `${TOKIDOKI_SPRITE_URL}?${params.toString()}`;
}

interface ParsedSpriteUrl {
  src: string;
  region: SpriteRegion;
}

export function parseSpriteImageUrl(url: string): ParsedSpriteUrl | null {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return null;
  const src = url.slice(0, queryIndex);
  const params = new URLSearchParams(url.slice(queryIndex + 1));
  const x = params.get("x");
  const y = params.get("y");
  const w = params.get("w");
  const h = params.get("h");
  if (x == null || y == null || w == null || h == null) return null;
  return { src, region: { x: Number(x), y: Number(y), w: Number(w), h: Number(h) } };
}

/**
 * Returns inline CSS (background-image/-position/-size) that crops the
 * encoded sprite region and scales it to fill a displayWidth x
 * displayHeight box, or null if `url` isn't a sprite-encoded URL (a plain
 * image URL should just be rendered as a normal <img> instead).
 */
export function spriteBackgroundStyle(
  url: string,
  displayWidth: number,
  displayHeight: number
): CSSProperties | null {
  const parsed = parseSpriteImageUrl(url);
  if (!parsed) return null;
  const { src, region } = parsed;
  const scaleX = displayWidth / region.w;
  const scaleY = displayHeight / region.h;
  return {
    backgroundImage: `url(${src})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `${-region.x * scaleX}px ${-region.y * scaleY}px`,
    backgroundSize: `${SPRITE_NATURAL_WIDTH * scaleX}px ${SPRITE_NATURAL_HEIGHT * scaleY}px`,
  };
}
