import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { seedDatabase } = await import("./seed");
  const mongoose = (await import("mongoose")).default;

  const result = await seedDatabase();
  console.log("Seed complete:", JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
