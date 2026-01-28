/*
  Warnings:

  - Made the column `maxAttendees` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "maxAttendees" SET NOT NULL;
