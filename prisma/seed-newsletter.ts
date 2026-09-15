import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not defined");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding newsletters...");

  const dummySubscribers = [
    {
      email: "budi.santoso@example.com",
      isActive: true,
      subscribedAt: new Date("2024-01-15T08:30:00Z"),
    },
    {
      email: "siti.aminah@example.com",
      isActive: true,
      subscribedAt: new Date("2024-02-10T14:45:00Z"),
    },
    {
      email: "joko.widodo@example.com",
      isActive: false,
      subscribedAt: new Date("2024-03-05T09:15:00Z"),
      unsubscribedAt: new Date("2024-05-20T10:00:00Z"),
    },
    {
      email: "rachel.vennya@example.com",
      isActive: true,
      subscribedAt: new Date("2024-04-12T11:20:00Z"),
    },
    {
      email: "ahmad.dhani@example.com",
      isActive: false,
      subscribedAt: new Date("2024-05-01T16:05:00Z"),
      unsubscribedAt: new Date("2024-06-15T08:30:00Z"),
    },
    {
      email: "lisa.blackpink@example.com",
      isActive: true,
      subscribedAt: new Date("2024-06-20T13:40:00Z"),
    },
    {
      email: "deddy.corbuzier@example.com",
      isActive: true,
      subscribedAt: new Date("2024-07-08T07:50:00Z"),
    },
    {
      email: "raditya.dika@example.com",
      isActive: true,
      subscribedAt: new Date("2024-08-14T19:25:00Z"),
    },
    {
      email: "agnes.mo@example.com",
      isActive: false,
      subscribedAt: new Date("2024-09-02T10:10:00Z"),
      unsubscribedAt: new Date("2024-09-10T15:00:00Z"),
    },
    {
      email: "raffi.ahmad@example.com",
      isActive: true,
      subscribedAt: new Date("2024-09-11T08:00:00Z"),
    },
  ];

  for (const subscriber of dummySubscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: {
        email: subscriber.email,
      },
      update: {},
      create: subscriber,
    });
  }

  console.log("Seeding newsletters finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
