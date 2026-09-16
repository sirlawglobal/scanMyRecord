import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import Programme from "@/models/Programme";

export type PublicProgramme = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  registrationOpen: boolean;
  images: string[];
  createdAt?: Date | string;
};

export type PublicFundraisingCampaign = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  status: string;
  imageUrl?: string;
  createdAt?: Date | string;
};

export async function getPublicProgrammeList(): Promise<PublicProgramme[]> {
  if (!hasValidMongoUri()) {
    return [];
  }

  try {
    await connectToDatabase();
    const programmes = await Programme.find({}).sort({ createdAt: -1 }).lean();

    return programmes.map((programme) => ({
      _id: String(programme._id),
      title: String(programme.title ?? "Untitled programme"),
      slug: String(programme.slug ?? ""),
      description: String(programme.description ?? ""),
      category: String(programme.category ?? "General"),
      status: String(programme.status ?? "active"),
      registrationOpen: Boolean(programme.registrationOpen),
      images: Array.isArray(programme.images) ? programme.images.map((image: unknown) => String(image)) : [],
      createdAt: programme.createdAt ?? new Date(),
    }));
  } catch {
    return [];
  }
}

export async function getPublicProgrammeBySlug(slug: string): Promise<PublicProgramme | null> {
  if (!slug || !hasValidMongoUri()) {
    return null;
  }

  try {
    await connectToDatabase();
    const programme = await Programme.findOne({ slug }).lean();

    if (!programme) {
      return null;
    }

    return {
      _id: String(programme._id),
      title: String(programme.title ?? "Untitled programme"),
      slug: String(programme.slug ?? slug),
      description: String(programme.description ?? ""),
      category: String(programme.category ?? "General"),
      status: String(programme.status ?? "active"),
      registrationOpen: Boolean(programme.registrationOpen),
      images: Array.isArray(programme.images) ? programme.images.map((image: unknown) => String(image)) : [],
      createdAt: programme.createdAt ?? new Date(),
    };
  } catch {
    return null;
  }
}

export async function getPublicFundraisingCampaignList(): Promise<PublicFundraisingCampaign[]> {
  if (!hasValidMongoUri()) {
    return [];
  }

  try {
    await connectToDatabase();
    const campaigns = await FundraisingCampaign.find({}).sort({ createdAt: -1 }).lean();

    return campaigns.map((campaign) => ({
      _id: String(campaign._id),
      title: String(campaign.title ?? "Untitled campaign"),
      slug: String(campaign.slug ?? ""),
      description: String(campaign.description ?? ""),
      targetAmount: Number(campaign.targetAmount ?? 0),
      raisedAmount: Number(campaign.raisedAmount ?? 0),
      status: String(campaign.status ?? "active"),
      imageUrl: campaign.imageUrl ? String(campaign.imageUrl) : "",
      createdAt: campaign.createdAt ?? new Date(),
    }));
  } catch {
    return [];
  }
}

export async function getPublicFundraisingCampaignBySlug(slug: string): Promise<PublicFundraisingCampaign | null> {
  if (!slug || !hasValidMongoUri()) {
    return null;
  }

  try {
    await connectToDatabase();
    const campaign = await FundraisingCampaign.findOne({ slug }).lean();

    if (!campaign) {
      return null;
    }

    return {
      _id: String(campaign._id),
      title: String(campaign.title ?? "Untitled campaign"),
      slug: String(campaign.slug ?? slug),
      description: String(campaign.description ?? ""),
      targetAmount: Number(campaign.targetAmount ?? 0),
      raisedAmount: Number(campaign.raisedAmount ?? 0),
      status: String(campaign.status ?? "active"),
      imageUrl: campaign.imageUrl ? String(campaign.imageUrl) : "",
      createdAt: campaign.createdAt ?? new Date(),
    };
  } catch {
    return null;
  }
}
