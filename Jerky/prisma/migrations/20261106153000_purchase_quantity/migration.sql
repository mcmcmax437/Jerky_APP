ALTER TABLE `PurchasedProduct`
  ADD COLUMN `quantity` DECIMAL(12, 3) NULL,
  ADD COLUMN `unit` ENUM('G', 'KG', 'ML', 'L', 'PCS') NULL;
