export function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

/** Returns `base`, or `base-2`, `base-3`... until no document uses it. */
export async function uniqueSlug(
  exists: (slug: string) => Promise<boolean>,
  base: string,
): Promise<string> {
  let candidate = base;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    if (!(await exists(candidate))) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}
