import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function dbConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1);
  }
}