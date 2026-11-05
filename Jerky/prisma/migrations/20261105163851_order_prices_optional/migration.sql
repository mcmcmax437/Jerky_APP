-- AlterTable
ALTER TABLE `order` MODIFY `subtotalMinor` INTEGER NULL,
    MODIFY `totalMinor` INTEGER NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `unitPriceMinor` INTEGER NULL,
    MODIFY `lineTotalMinor` INTEGER NULL;
