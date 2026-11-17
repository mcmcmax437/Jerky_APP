ALTER TABLE `PurchasedProduct` DROP FOREIGN KEY `PurchasedProduct_recipeId_fkey`;

ALTER TABLE `PurchasedProduct` ADD COLUMN `ingredientId` VARCHAR(191) NULL,
    MODIFY `recipeId` VARCHAR(191) NULL,
    MODIFY `componentName` VARCHAR(160) NULL;

CREATE INDEX `PurchasedProduct_ingredientId_purchasedOn_idx` ON `PurchasedProduct`(`ingredientId`, `purchasedOn`);

ALTER TABLE `PurchasedProduct` ADD CONSTRAINT `PurchasedProduct_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PurchasedProduct` ADD CONSTRAINT `PurchasedProduct_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
