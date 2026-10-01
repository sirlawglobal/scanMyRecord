export type CoverMedia = { url: string; type: "image" | "video" };

/** First media item (the order admins set) decides the cover; falls back to the flat image list. */
export function pickCover(
  media: { url: string; type: "image" | "video" }[] | undefined,
  images: string[] | undefined,
): CoverMedia | null {
  const first = media?.find((item) => item.url);

  if (first) {
    return { url: first.url, type: first.type };
  }

  return images?.[0] ? { url: images[0], type: "image" } : null;
}
