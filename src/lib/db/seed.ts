import { hashPassword } from "@/lib/auth/password";
import { connectToDatabase } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import Politician from "@/models/Politician";
import Programme from "@/models/Programme";
import Project from "@/models/Project";
import User from "@/models/User";

export async function seedDatabase() {
  await connectToDatabase();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const politicianName = process.env.NEXT_PUBLIC_POLITICIAN_NAME?.trim() || "Public official";
  const politicianOffice = process.env.NEXT_PUBLIC_POLITICIAN_OFFICE?.trim() || "Elected office";
  const politicianConstituency = process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY?.trim() || "Constituency";
  const politicianSlug = process.env.NEXT_PUBLIC_POLITICIAN_SLUG?.trim() || "public-official";

  if (adminEmail && adminPassword) {
    const existingUser = await User.findOne({ email: adminEmail });

    if (!existingUser) {
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: "SUPER_ADMIN",
        isActive: true,
      });
    } else {
      await User.findByIdAndUpdate(existingUser._id, {
        name: "System Administrator",
        passwordHash: await hashPassword(adminPassword),
        role: "SUPER_ADMIN",
        isActive: true,
      });
    }
  }

  let politician = await Politician.findOne({ slug: politicianSlug });

  if (!politician) {
    politician = await Politician.create({
      name: politicianName,
      slug: politicianSlug,
      office: politicianOffice,
      constituency: politicianConstituency,
      servicePeriod: "2022–2026",
      bio: process.env.NEXT_PUBLIC_POLITICIAN_TAGLINE?.trim() || "Public service profile ready for live update.",
      profileImage: "",
      socialLinks: {},
    });
  }

  const politicianId = politician._id;

  const programmeSeeds = [
    {
      title: "Education Support Fund",
      slug: "education-support-fund",
      description: "Targeted support for school fees, digital access, and educational materials for families facing financial barriers.",
      status: "active",
      registrationOpen: true,
    },
    {
      title: "Medical Outreach Initiative",
      slug: "medical-outreach-initiative",
      description: "Free health screenings, consultations, and referral support across underserved communities in the constituency.",
      status: "active",
      registrationOpen: true,
    },
    {
      title: "Youth Empowerment Programme",
      slug: "youth-empowerment-programme",
      description: "Leadership, enterprise, and skills development for young adults preparing to contribute to local economic growth.",
      status: "active",
      registrationOpen: false,
    },
    {
      title: "Skills Training Scheme",
      slug: "skills-training-scheme",
      description: "Hands-on learning support in digital and vocational skills to improve employability and self-reliance.",
      status: "active",
      registrationOpen: true,
    },
  ];

  for (const programme of programmeSeeds) {
    await Programme.findOneAndUpdate(
      { slug: programme.slug },
      { ...programme, politicianId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const campaignSeeds = [
    {
      title: "Community Health Drive",
      slug: "community-health-drive",
      description: "Funding for medical outreach, emergency response support, and primary healthcare access for vulnerable residents.",
      targetAmount: 2500000,
      raisedAmount: 980000,
      status: "active",
    },
    {
      title: "School Support Fund",
      slug: "school-support-fund",
      description: "Support for school materials, tuition relief, and digital access for students in low-income households.",
      targetAmount: 1800000,
      raisedAmount: 760000,
      status: "active",
    },
  ];

  for (const campaign of campaignSeeds) {
    await FundraisingCampaign.findOneAndUpdate(
      { slug: campaign.slug },
      { ...campaign, politicianId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const projectSeeds = [
    {
      title: "Primary Healthcare Renewal",
      slug: "primary-healthcare-renewal",
      summary: "Infrastructure upgrade and equipment replacement for community clinics.",
      status: "completed",
      category: "Healthcare",
      year: 2024,
      location: "Ife East",
    },
    {
      title: "Rural Road Rehabilitation",
      slug: "rural-road-rehabilitation",
      summary: "Paving and drainage repairs to improve accessibility and economic movement.",
      status: "ongoing",
      category: "Infrastructure",
      year: 2025,
      location: "Ife East",
    },
    {
      title: "Digital Learning Access",
      slug: "digital-learning-access",
      summary: "Distribution of digital learning equipment to public schools and youth hubs.",
      status: "completed",
      category: "Education",
      year: 2023,
      location: "Constituency-wide",
    },
    {
      title: "Youth Skills Hub",
      slug: "youth-skills-hub",
      summary: "Community training center focused on vocational and digital workforce development.",
      status: "proposed",
      category: "Youth",
      year: 2026,
      location: "Central Ward",
    },
  ];

  for (const project of projectSeeds) {
    await Project.findOneAndUpdate(
      { slug: project.slug },
      { ...project, politicianId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  return {
    politician: {
      name: politicianName,
      slug: politicianSlug,
      office: politicianOffice,
      constituency: politicianConstituency,
    },
    admin: { email: adminEmail ?? "not-configured", role: "SUPER_ADMIN" },
    counts: {
      programmes: programmeSeeds.length,
      campaigns: campaignSeeds.length,
      projects: projectSeeds.length,
    },
  };
}
