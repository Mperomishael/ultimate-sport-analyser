import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@footballpredictions.com" },
    update: {},
    create: {
      email: "admin@footballpredictions.com",
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.predictionWeight.upsert({
    where: { name: "default" },
    update: {},
    create: {
      name: "default",
      recentForm: 0.20,
      h2h: 0.15,
      homeAwayForm: 0.15,
      goalsTrend: 0.15,
      injuries: 0.10,
      oddsMovement: 0.10,
      standings: 0.10,
      motivation: 0.05,
      isActive: true,
    },
  });

  const configs = [
    { key: "cache_ttl", value: 300, description: "Cache TTL in seconds" },
    { key: "rate_limit_requests", value: 60, description: "Rate limit requests per minute" },
    { key: "prediction_refresh_hours", value: 6, description: "Prediction refresh interval" },
    { key: "min_confidence_threshold", value: 50, description: "Minimum confidence for predictions" },
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {},
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
