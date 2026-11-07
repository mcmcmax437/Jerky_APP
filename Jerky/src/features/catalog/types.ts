export type CatalogImage = {
  src: string;
  kind: string;
  placeholder: boolean;
};

import type { MeatTypeName } from "@/features/admin/recipe";

export type CatalogProduct = {
  slug: string;
  name: string;
  card: string | null;
  profile: string;
  netWeightG: number;
  priceMinor: number | null;
  currency: string;
  accent: "bone" | "teriyaki" | "chili";
  meat: MeatTypeName | null;
  images: CatalogImage[];
  approvedReviewCount: number;
  averageRating: number | null;
};
