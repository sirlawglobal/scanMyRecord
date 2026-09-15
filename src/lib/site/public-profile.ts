export type PublicProfileConfig = {
  slug: string;
  name: string;
  office: string;
  constituency: string;
  tagline: string;
};

export function getDefaultPoliticianSlug() {
  return process.env.NEXT_PUBLIC_POLITICIAN_SLUG?.trim() || "mr-temple";
}

export function getPublicProfileFallback(): PublicProfileConfig {
  return {
    slug: getDefaultPoliticianSlug(),
    name: process.env.NEXT_PUBLIC_POLITICIAN_NAME?.trim() || "Public profile not configured",
    office: process.env.NEXT_PUBLIC_POLITICIAN_OFFICE?.trim() || "Add your elected office to continue",
    constituency: process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY?.trim() || "Configuration required",
    tagline:
      process.env.NEXT_PUBLIC_POLITICIAN_TAGLINE?.trim() ||
      "This public profile is waiting for your live content.",
  };
}
