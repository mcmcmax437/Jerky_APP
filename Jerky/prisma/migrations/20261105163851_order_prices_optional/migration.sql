-- AlterTable
ALTER TABLE `Order` MODIFY `subtotalMinor` INTEGER NULL,
    MODIFY `totalMinor` INTEGER NULL;

-- AlterTable
ALTER TABLE `OrderItem` MODIFY `unitPriceMinor` INTEGER NULL,
    MODIFY `lineTotalMinor` INTEGER NULL;
