export type CatalogImage = {
  src: string;
  kind: string;
  placeholder: boolean;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  card: string | null;
  profile: string;
  netWeightG: number;
  priceMinor: number | null;
  currency: string;
  accent: "bone" | "teriyaki" | "chili";
  images: CatalogImage[];
  approvedReviewCount: number;
  averageRating: number | null;
};
