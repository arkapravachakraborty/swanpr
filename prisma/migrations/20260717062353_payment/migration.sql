-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "razorpaySubscriptionId" TEXT,
ADD COLUMN     "subscriptionRenewAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT;
