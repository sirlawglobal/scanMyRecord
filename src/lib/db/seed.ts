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

  const image = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

  const programmeSeeds = [
    {
      title: "Education Support Fund",
      slug: "education-support-fund",
      description: "Targeted support for school fees, digital access, and educational materials for families facing financial barriers.",
      status: "active",
      registrationOpen: true,
      capacity: 500,
      registrationDeadline: new Date("2026-12-31"),
      images: [image("education-support-fund-1"), image("education-support-fund-2")],
    },
    {
      title: "Medical Outreach Initiative",
      slug: "medical-outreach-initiative",
      description: "Free health screenings, consultations, and referral support across underserved communities in the constituency.",
      status: "active",
      registrationOpen: true,
      capacity: 300,
      registrationDeadline: null,
      images: [image("medical-outreach-initiative")],
    },
    {
      title: "Youth Empowerment Programme",
      slug: "youth-empowerment-programme",
      description: "Leadership, enterprise, and skills development for young adults preparing to contribute to local economic growth.",
      status: "active",
      registrationOpen: false,
      capacity: null,
      registrationDeadline: null,
      images: [image("youth-empowerment-programme")],
    },
    {
      title: "Skills Training Scheme",
      slug: "skills-training-scheme",
      description: "Hands-on learning support in digital and vocational skills to improve employability and self-reliance.",
      status: "active",
      registrationOpen: true,
      capacity: null,
      registrationDeadline: new Date("2026-11-15"),
      images: [image("skills-training-scheme")],
    },
    {
      title: "Women Entrepreneurs Micro-Grant",
      slug: "women-entrepreneurs-micro-grant",
      description: "Seed capital and business mentorship for women-led micro and small businesses across the constituency.",
      status: "active",
      registrationOpen: true,
      capacity: 150,
      registrationDeadline: new Date("2026-10-31"),
      images: [image("women-entrepreneurs-micro-grant")],
    },
    {
      title: "Elderly Care & Wellness Programme",
      slug: "elderly-care-wellness-programme",
      description: "Home visits, mobility aids, and wellness checks for senior residents across the constituency.",
      status: "active",
      registrationOpen: true,
      capacity: null,
      registrationDeadline: null,
      images: [image("elderly-care-wellness-programme")],
    },
    {
      title: "School Feeding Initiative",
      slug: "school-feeding-initiative",
      description: "Daily nutritious meals for pupils in public primary schools, improving attendance and learning outcomes.",
      status: "active",
      registrationOpen: false,
      capacity: null,
      registrationDeadline: null,
      images: [image("school-feeding-initiative-1"), image("school-feeding-initiative-2")],
    },
    {
      title: "Agricultural Inputs Support Scheme",
      slug: "agricultural-inputs-support-scheme",
      description: "Subsidized seedlings, fertilizer, and farming equipment for smallholder farmers ahead of the planting season.",
      status: "active",
      registrationOpen: true,
      capacity: 400,
      registrationDeadline: new Date("2027-01-31"),
      images: [image("agricultural-inputs-support-scheme")],
    },
    {
      title: "Digital Literacy Bootcamp",
      slug: "digital-literacy-bootcamp",
      description: "Foundational computer and internet skills training for residents preparing to enter the digital economy.",
      status: "paused",
      registrationOpen: false,
      capacity: 120,
      registrationDeadline: null,
      images: [image("digital-literacy-bootcamp")],
    },
    {
      title: "Community Sports & Recreation Programme",
      slug: "community-sports-recreation-programme",
      description: "Youth sports leagues, equipment donations, and recreational facility upgrades across the constituency.",
      status: "active",
      registrationOpen: true,
      capacity: null,
      registrationDeadline: null,
      images: [image("community-sports-recreation-programme")],
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
      images: [image("primary-healthcare-renewal-1"), image("primary-healthcare-renewal-2")],
    },
    {
      title: "Rural Road Rehabilitation",
      slug: "rural-road-rehabilitation",
      summary: "Paving and drainage repairs to improve accessibility and economic movement.",
      status: "ongoing",
      category: "Infrastructure",
      year: 2025,
      location: "Ife East",
      images: [image("rural-road-rehabilitation")],
    },
    {
      title: "Digital Learning Access",
      slug: "digital-learning-access",
      summary: "Distribution of digital learning equipment to public schools and youth hubs.",
      status: "completed",
      category: "Education",
      year: 2023,
      location: "Constituency-wide",
      images: [image("digital-learning-access-1"), image("digital-learning-access-2")],
    },
    {
      title: "Youth Skills Hub",
      slug: "youth-skills-hub",
      summary: "Community training center focused on vocational and digital workforce development.",
      status: "proposed",
      category: "Youth",
      year: 2026,
      location: "Central Ward",
      images: [image("youth-skills-hub")],
    },
    {
      title: "Community Water Borehole Scheme",
      slug: "community-water-borehole-scheme",
      summary: "Solar-powered boreholes providing clean water access to underserved wards.",
      status: "completed",
      category: "Water",
      year: 2022,
      location: "Ife North",
      images: [image("community-water-borehole-scheme")],
    },
    {
      title: "Maternal Health Clinic Upgrade",
      slug: "maternal-health-clinic-upgrade",
      summary: "Expanded maternity ward, new equipment, and additional trained staff.",
      status: "completed",
      category: "Healthcare",
      year: 2024,
      location: "Ife East",
      images: [image("maternal-health-clinic-upgrade")],
    },
    {
      title: "Solar Streetlight Installation",
      slug: "solar-streetlight-installation",
      summary: "Solar-powered street lighting along major roads to improve safety at night.",
      status: "ongoing",
      category: "Infrastructure",
      year: 2025,
      location: "Central Ward",
      images: [image("solar-streetlight-installation")],
    },
    {
      title: "School Renovation Initiative",
      slug: "school-renovation-initiative",
      summary: "Classroom blocks, furniture, and sanitation facilities rebuilt across public schools.",
      status: "completed",
      category: "Education",
      year: 2022,
      location: "Ife North",
      images: [image("school-renovation-initiative-1"), image("school-renovation-initiative-2")],
    },
    {
      title: "Youth Entrepreneurship Grants",
      slug: "youth-entrepreneurship-grants",
      summary: "Seed funding and mentorship for youth-led small businesses across the constituency.",
      status: "ongoing",
      category: "Youth",
      year: 2025,
      location: "Constituency-wide",
      images: [image("youth-entrepreneurship-grants")],
    },
    {
      title: "Flood Control Drainage Project",
      slug: "flood-control-drainage-project",
      summary: "Major drainage works to reduce seasonal flooding in low-lying residential areas.",
      status: "proposed",
      category: "Infrastructure",
      year: 2026,
      location: "Ife East",
      images: [image("flood-control-drainage-project")],
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
