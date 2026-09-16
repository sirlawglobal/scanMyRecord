import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Politician from "@/models/Politician";
import { getPublicProfileFallback } from "./public-profile";

export async function getPublicProfileConfig() {
  const fallback = getPublicProfileFallback();

  if (!hasValidMongoUri()) {
    return fallback;
  }

  try {
    await connectToDatabase();
    const politician = await Politician.findOne({}).sort({ createdAt: -1 }).lean();

    if (!politician) {
      return fallback;
    }

    return {
      slug: String(politician.slug || fallback.slug),
      name: String(politician.name || fallback.name),
      office: String(politician.office || fallback.office),
      constituency: String(politician.constituency || fallback.constituency),
      tagline: String(politician.bio || fallback.tagline),
      profileImage: String(politician.profileImage || fallback.profileImage || ""),
    };
  } catch {
    return fallback;
  }
}

export async function getPublicProfileInfo() {
  return getPublicProfileConfig();
}
