const packshots: Record<string, string> = {
  original: "/catalog/original.jpg",
  teriyaki: "/catalog/teriyaki.jpg",
  "hot-chili": "/catalog/hot-chili.jpg",
};

export const catalogPackshotFallback = "/catalog/unknown.jpg";

export function catalogPackshot(slug: string) {
  return packshots[slug] ?? catalogPackshotFallback;
}
