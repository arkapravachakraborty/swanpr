/*
  Warnings:

  - You are about to drop the column `subscriptionRenewAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "subscriptionRenewAt",
ADD COLUMN     "subscriptionRenewsAt" TIMESTAMP(3);
