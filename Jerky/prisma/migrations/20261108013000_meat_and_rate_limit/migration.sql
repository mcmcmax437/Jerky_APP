-- AlterTable
ALTER TABLE `Product` ADD COLUMN `meatType` ENUM('CHICKEN', 'BEEF', 'PORK', 'TURKEY', 'SALMON', 'SHRIMP') NULL;

-- The published shop line is beef jerky. Leave every other product unset.
UPDATE `Product` SET `meatType` = 'BEEF'
WHERE `slug` IN ('original', 'black-pepper', 'teriyaki', 'honey', 'hot-chili', 'smoked')
  AND `meatType` IS NULL;

-- CreateTable
CREATE TABLE `RateLimit` (
    `id` VARCHAR(191) NOT NULL,
    `bucket` VARCHAR(40) NOT NULL,
    `key` VARCHAR(190) NOT NULL,
    `hits` INTEGER NOT NULL DEFAULT 0,
    `windowStart` DATETIME(3) NOT NULL,
    `lockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RateLimit_bucket_key_key`(`bucket`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
