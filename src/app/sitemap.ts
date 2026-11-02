import type { MetadataRoute } from "next";
import { getPublicProgrammeList } from "@/lib/site/content";
import { getPublicProjectList } from "@/lib/site/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  const [projects, programmes] = await Promise.all([
    getPublicProjectList(),
    getPublicProgrammeList(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: appUrl, changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/projects`, changeFrequency: "daily", priority: 0.8 },
    { url: `${appUrl}/programmes`, changeFrequency: "daily", priority: 0.8 },
  ];

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${appUrl}/projects/${project.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const programmeEntries: MetadataRoute.Sitemap = programmes.map((programme) => ({
    url: `${appUrl}/programmes/${programme.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries, ...programmeEntries];
}
