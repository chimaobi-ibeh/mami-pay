require('dotenv').config();
const sequelize = require('../config/database');

const migrations = [
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "passwordResetToken" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP WITH TIME ZONE`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "nyscServiceNumber" VARCHAR(255) UNIQUE`,
  `ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'corper'`,
  `ALTER TYPE "enum_Transactions_type" ADD VALUE IF NOT EXISTS 'top_up'`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "shopName" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "shopCategory" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "callUpDate" DATE`,
  `ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "shopDescription" TEXT`,
  `UPDATE "Users" SET role = 'corper' WHERE role = 'employee'`,
  `CREATE TABLE IF NOT EXISTS "SavingsVaults" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "balance" DECIMAL(15,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  )`,
];

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    for (const sql of migrations) {
      await sequelize.query(sql);
      console.log(`OK: ${sql.slice(0, 60)}...`);
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sequelize.close();
  }
};

run();
