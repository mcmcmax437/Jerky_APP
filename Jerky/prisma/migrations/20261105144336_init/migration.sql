-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `netWeightG` INTEGER NOT NULL DEFAULT 100,
    `priceMinor` INTEGER NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',
    `published` BOOLEAN NOT NULL DEFAULT false,
    `accent` VARCHAR(32) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `ingredientsConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `allergensConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `nutritionConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `storageConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_published_sortOrder_idx`(`published`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `profile` TEXT NOT NULL,

    UNIQUE INDEX `ProductTranslation_productId_locale_key`(`productId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductMedia` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(32) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `publicPath` VARCHAR(255) NOT NULL,
    `isPlaceholder` BOOLEAN NOT NULL DEFAULT true,

    INDEX `ProductMedia_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(32) NOT NULL,
    `isTest` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'NEW',
    `locale` VARCHAR(5) NOT NULL,
    `customerName` VARCHAR(160) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `country` VARCHAR(80) NULL,
    `city` VARCHAR(120) NULL,
    `postalCode` VARCHAR(20) NULL,
    `addressLine` VARCHAR(255) NULL,
    `subtotalMinor` INTEGER NOT NULL,
    `totalMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_number_key`(`number`),
    INDEX `Order_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Order_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `netWeightG` INTEGER NOT NULL,
    `unitPriceMinor` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `lineTotalMinor` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusEvent` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') NULL,
    `toStatus` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL,
    `note` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusEvent_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderNote` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderNote_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ingredient` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `unit` ENUM('G', 'KG', 'ML', 'L', 'PCS') NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngredientPriceRecord` (
    `id` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `pricePerUnit` DECIMAL(12, 4) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',
    `supplierNote` VARCHAR(255) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IngredientPriceRecord_ingredientId_recordedAt_idx`(`ingredientId`, `recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recipe` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `title` VARCHAR(160) NOT NULL,
    `status` ENUM('DRAFT', 'TESTING', 'APPROVED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Recipe_productId_status_idx`(`productId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeVersion` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `rawMeatWeightG` INTEGER NULL,
    `cutName` VARCHAR(160) NULL,
    `marinadeNotes` TEXT NULL,
    `marinadeHours` DECIMAL(8, 2) NULL,
    `sliceMethod` VARCHAR(255) NULL,
    `sliceThicknessMm` DECIMAL(6, 2) NULL,
    `equipment` TEXT NULL,
    `processPlan` TEXT NULL,
    `ownerNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RecipeVersion_recipeId_versionNumber_key`(`recipeId`, `versionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeIngredient` (
    `id` VARCHAR(191) NOT NULL,
    `recipeVersionId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NULL,
    `name` VARCHAR(160) NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unit` ENUM('G', 'KG', 'ML', 'L', 'PCS') NOT NULL,
    `plannedUnitPrice` DECIMAL(12, 4) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `RecipeIngredient_recipeVersionId_sortOrder_idx`(`recipeVersionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeStep` (
    `id` VARCHAR(191) NOT NULL,
    `recipeVersionId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `body` TEXT NOT NULL,

    INDEX `RecipeStep_recipeVersionId_sortOrder_idx`(`recipeVersionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestBatch` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `recipeVersionId` VARCHAR(191) NOT NULL,
    `madeOn` DATETIME(3) NOT NULL,
    `rawMeatWeightG` INTEGER NULL,
    `sliceThicknessMm` DECIMAL(6, 2) NULL,
    `marinadeHours` DECIMAL(8, 2) NULL,
    `equipment` TEXT NULL,
    `processLog` TEXT NULL,
    `deviationNotes` TEXT NULL,
    `decision` ENUM('PASS', 'REPEAT', 'FAIL') NULL,

    UNIQUE INDEX `TestBatch_code_key`(`code`),
    INDEX `TestBatch_recipeVersionId_madeOn_idx`(`recipeVersionId`, `madeOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchIngredientUsage` (
    `id` VARCHAR(191) NOT NULL,
    `testBatchId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NULL,
    `name` VARCHAR(160) NOT NULL,
    `plannedQty` DECIMAL(12, 3) NULL,
    `actualQty` DECIMAL(12, 3) NOT NULL,
    `unit` ENUM('G', 'KG', 'ML', 'L', 'PCS') NOT NULL,
    `unitPrice` DECIMAL(12, 4) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',

    INDEX `BatchIngredientUsage_testBatchId_idx`(`testBatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchCostLine` (
    `id` VARCHAR(191) NOT NULL,
    `testBatchId` VARCHAR(191) NOT NULL,
    `category` ENUM('MEAT', 'INGREDIENT', 'CONSUMABLE', 'PACKAGING', 'ELECTRICITY', 'UTILITIES', 'LABOR', 'EQUIPMENT', 'OTHER') NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'PLN',
    `included` BOOLEAN NOT NULL DEFAULT true,
    `direct` BOOLEAN NOT NULL DEFAULT true,
    `note` VARCHAR(500) NULL,

    INDEX `BatchCostLine_testBatchId_category_idx`(`testBatchId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchOutput` (
    `id` VARCHAR(191) NOT NULL,
    `testBatchId` VARCHAR(191) NOT NULL,
    `rawMeatWeightG` INTEGER NOT NULL,
    `finishedWeightG` INTEGER NOT NULL,
    `saleableWeightG` INTEGER NOT NULL,
    `sampleWeightG` INTEGER NOT NULL DEFAULT 0,
    `wasteWeightG` INTEGER NOT NULL DEFAULT 0,
    `yieldPercent` DECIMAL(6, 2) NOT NULL,
    `saleablePackCount100g` INTEGER NOT NULL,
    `remainderG` INTEGER NOT NULL,

    UNIQUE INDEX `BatchOutput_testBatchId_key`(`testBatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `testBatchId` VARCHAR(191) NOT NULL,
    `taste` INTEGER NOT NULL,
    `texture` INTEGER NOT NULL,
    `aroma` INTEGER NOT NULL,
    `appearance` INTEGER NOT NULL,
    `saltBalance` INTEGER NOT NULL,
    `heatBalance` INTEGER NULL,
    `repeatability` INTEGER NOT NULL,
    `overall` INTEGER NOT NULL,
    `wentWell` TEXT NULL,
    `wentPoorly` TEXT NULL,
    `nextChange` TEXT NULL,
    `ownerNote` TEXT NULL,
    `decision` ENUM('PASS', 'REPEAT', 'FAIL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BatchEvaluation_testBatchId_key`(`testBatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerReview` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `body` TEXT NOT NULL,
    `displayName` VARCHAR(80) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN') NOT NULL DEFAULT 'PENDING',
    `moderatorNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerReview_productId_status_idx`(`productId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `relativePath` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(80) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `category` ENUM('INGREDIENTS', 'CUTTING', 'MARINADE', 'PRE_DRY', 'PROCESS', 'RESULT', 'PACKAGING', 'PACKSHOT', 'LIFESTYLE', 'HERO', 'TEXTURE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `isPrivate` BOOLEAN NOT NULL DEFAULT true,
    `recipeVersionId` VARCHAR(191) NULL,
    `testBatchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaAsset_recipeVersionId_idx`(`recipeVersionId`),
    INDEX `MediaAsset_testBatchId_idx`(`testBatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSetting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(80) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductTranslation` ADD CONSTRAINT `ProductTranslation_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMedia` ADD CONSTRAINT `ProductMedia_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusEvent` ADD CONSTRAINT `OrderStatusEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderNote` ADD CONSTRAINT `OrderNote_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngredientPriceRecord` ADD CONSTRAINT `IngredientPriceRecord_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeVersion` ADD CONSTRAINT `RecipeVersion_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_recipeVersionId_fkey` FOREIGN KEY (`recipeVersionId`) REFERENCES `RecipeVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeStep` ADD CONSTRAINT `RecipeStep_recipeVersionId_fkey` FOREIGN KEY (`recipeVersionId`) REFERENCES `RecipeVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestBatch` ADD CONSTRAINT `TestBatch_recipeVersionId_fkey` FOREIGN KEY (`recipeVersionId`) REFERENCES `RecipeVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchIngredientUsage` ADD CONSTRAINT `BatchIngredientUsage_testBatchId_fkey` FOREIGN KEY (`testBatchId`) REFERENCES `TestBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchIngredientUsage` ADD CONSTRAINT `BatchIngredientUsage_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchCostLine` ADD CONSTRAINT `BatchCostLine_testBatchId_fkey` FOREIGN KEY (`testBatchId`) REFERENCES `TestBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchOutput` ADD CONSTRAINT `BatchOutput_testBatchId_fkey` FOREIGN KEY (`testBatchId`) REFERENCES `TestBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchEvaluation` ADD CONSTRAINT `BatchEvaluation_testBatchId_fkey` FOREIGN KEY (`testBatchId`) REFERENCES `TestBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerReview` ADD CONSTRAINT `CustomerReview_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerReview` ADD CONSTRAINT `CustomerReview_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_recipeVersionId_fkey` FOREIGN KEY (`recipeVersionId`) REFERENCES `RecipeVersion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_testBatchId_fkey` FOREIGN KEY (`testBatchId`) REFERENCES `TestBatch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
