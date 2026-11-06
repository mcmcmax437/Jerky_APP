export const recipeUnits = ["G", "KG", "ML", "L", "PCS"] as const;
export const recipeStatuses = ["DRAFT", "TESTING", "APPROVED", "ARCHIVED"] as const;
export const meatTypes = ["CHICKEN", "BEEF", "PORK", "TURKEY", "SALMON", "SHRIMP"] as const;

export type RecipeUnit = (typeof recipeUnits)[number];
export type RecipeStatusName = (typeof recipeStatuses)[number];
export type MeatTypeName = (typeof meatTypes)[number];

export type RecipeDraft = {
  title: string;
  productId: string | null;
  status: RecipeStatusName;
  meatType: MeatTypeName;
  marinadeHours: number | null;
  processPlan: string | null;
  components: { name: string; quantity: number; unit: RecipeUnit; unitPrice: number | null }[];
  mode: "save" | "version";
};

function optionalText(value: string, max: number) {
  const text = value.trim();
  if (!text) return null;
  if (text.length > max) return "invalid" as const;
  return text;
}

function optionalNumber(value: string, scale: number) {
  const text = value.trim().replace(",", ".");
  if (!text) return null;
  if (!/^\d+(\.\d+)?$/.test(text)) return "invalid" as const;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) return "invalid" as const;
  const factor = 10 ** scale;
  return Math.round(number * factor) / factor;
}

export function parseRecipeForm(formData: FormData): { ok: true; data: RecipeDraft } | { ok: false } {
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const productId = String(formData.get("productId") ?? "").trim();
  const meatType = String(formData.get("meatType") ?? "");
  const mode = String(formData.get("mode") ?? "save");
  if (title.length < 1 || title.length > 160) return { ok: false };
  if (!recipeStatuses.includes(status as RecipeStatusName)) return { ok: false };
  if (!meatTypes.includes(meatType as MeatTypeName)) return { ok: false };
  if (mode !== "save" && mode !== "version") return { ok: false };

  const marinadeHours = optionalNumber(String(formData.get("marinadeHours") ?? ""), 2);
  const processPlan = optionalText(String(formData.get("processPlan") ?? ""), 8000);
  if (marinadeHours === "invalid" || processPlan === "invalid") return { ok: false };

  const names = formData.getAll("componentName").map((item) => String(item));
  const quantities = formData.getAll("componentQty").map((item) => String(item));
  const units = formData.getAll("componentUnit").map((item) => String(item));
  const prices = formData.getAll("componentPrice").map((item) => String(item));
  if (names.length !== quantities.length || names.length !== units.length || names.length !== prices.length) return { ok: false };
  const components: RecipeDraft["components"] = [];
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index].trim();
    const quantityText = quantities[index].trim();
    const unit = units[index];
    if (!name && !quantityText && !prices[index].trim()) continue;
    const quantity = optionalNumber(quantityText, 3);
    const unitPrice = optionalNumber(prices[index], 4);
    if (!name || name.length > 160 || quantity == null || quantity === "invalid" || quantity <= 0) return { ok: false };
    if (unitPrice === "invalid") return { ok: false };
    if (!recipeUnits.includes(unit as RecipeUnit)) return { ok: false };
    components.push({ name, quantity, unit: unit as RecipeUnit, unitPrice });
  }

  return {
    ok: true,
    data: {
      title,
      productId: productId || null,
      status: status as RecipeStatusName,
      meatType: meatType as MeatTypeName,
      marinadeHours,
      processPlan,
      components,
      mode,
    },
  };
}
