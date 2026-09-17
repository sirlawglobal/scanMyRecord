import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Project from "@/models/Project";

export type ProjectMediaItem = {
  url: string;
  type: "image" | "video";
  stage: "before" | "after" | "general";
  caption: string;
};

export type PublicProject = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  status: "completed" | "ongoing" | "proposed";
  category: string;
  year: number;
  location: string;
  images: string[];
  media: ProjectMediaItem[];
  createdAt?: Date | string;
};

function toMediaItems(project: Record<string, unknown>): ProjectMediaItem[] {
  if (Array.isArray(project.media) && project.media.length > 0) {
    return project.media.map((item) => {
      const media = item as Record<string, unknown>;
      return {
        url: String(media.url ?? ""),
        type: media.type === "video" ? "video" : "image",
        stage: ["before", "after"].includes(String(media.stage)) ? (media.stage as "before" | "after") : "general",
        caption: String(media.caption ?? ""),
      };
    });
  }

  // Back-compat: older records only have the flat `images` array.
  return Array.isArray(project.images)
    ? project.images.map((image) => ({ url: String(image), type: "image" as const, stage: "general" as const, caption: "" }))
    : [];
}

export type ProjectStats = {
  completed: number;
  ongoing: number;
  proposed: number;
  categories: string[];
  years: number[];
};

type ProjectFilters = {
  status?: string;
  category?: string;
  year?: number;
};

function toPublicProject(project: Record<string, unknown>): PublicProject {
  const media = toMediaItems(project);

  return {
    _id: String(project._id),
    title: String(project.title ?? "Untitled project"),
    slug: String(project.slug ?? ""),
    summary: String(project.summary ?? ""),
    status: (["completed", "ongoing", "proposed"].includes(String(project.status))
      ? project.status
      : "proposed") as PublicProject["status"],
    category: String(project.category ?? ""),
    year: Number(project.year ?? 0),
    location: String(project.location ?? ""),
    images: media.filter((item) => item.type === "image").map((item) => item.url),
    media,
    createdAt: (project.createdAt as Date | string | undefined) ?? new Date(),
  };
}

export async function getPublicProjectList(filters?: ProjectFilters): Promise<PublicProject[]> {
  if (!hasValidMongoUri()) {
    return [];
  }

  try {
    await connectToDatabase();

    const query: Record<string, unknown> = { archived: { $ne: true } };
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.year) {
      query.year = filters.year;
    }

    const projects = await Project.find(query)
      .sort({ year: -1, createdAt: -1 })
      .lean();

    return projects.map((project) => toPublicProject(project as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<PublicProject | null> {
  if (!slug || !hasValidMongoUri()) {
    return null;
  }

  try {
    await connectToDatabase();
    const project = await Project.findOne({ slug, archived: { $ne: true } }).lean();

    if (!project) {
      return null;
    }

    return toPublicProject(project as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getProjectStats(): Promise<ProjectStats> {
  const emptyStats: ProjectStats = { completed: 0, ongoing: 0, proposed: 0, categories: [], years: [] };

  if (!hasValidMongoUri()) {
    return emptyStats;
  }

  try {
    await connectToDatabase();

    const notArchived = { archived: { $ne: true } };
    const [completed, ongoing, proposed, categories, years] = await Promise.all([
      Project.countDocuments({ ...notArchived, status: "completed" }),
      Project.countDocuments({ ...notArchived, status: "ongoing" }),
      Project.countDocuments({ ...notArchived, status: "proposed" }),
      Project.distinct("category", notArchived),
      Project.distinct("year", notArchived),
    ]);

    return {
      completed: Number(completed ?? 0),
      ongoing: Number(ongoing ?? 0),
      proposed: Number(proposed ?? 0),
      categories: (categories as unknown[]).map((category) => String(category)).filter(Boolean).sort(),
      years: (years as unknown[])
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year) && year > 0)
        .sort((a, b) => b - a),
    };
  } catch {
    return emptyStats;
  }
}
