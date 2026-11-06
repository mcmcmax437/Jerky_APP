export type PurchaseQr = {
  name: string;
  recipe: string | null;
  component: string;
};

export type PurchaseLine = {
  recipeId: string;
  recipeTitle: string;
  componentName: string;
};

function clip(value: string) {
  const text = value.trim();
  if (!text || text.length > 160) return null;
  return text;
}

function field(value: unknown) {
  return typeof value === "string" ? clip(value) : null;
}

export function parsePurchaseQr(raw: string): PurchaseQr | null {
  const text = raw.trim();
  if (!text || text.length > 500) return null;

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text) as { name?: unknown; recipe?: unknown; component?: unknown };
      const component = field(data.component) ?? field(data.name);
      const name = field(data.name) ?? component;
      if (!component || !name) return null;
      return { name, recipe: field(data.recipe), component };
    } catch {
      return null;
    }
  }

  const parts = text.split("|").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 1) {
    const component = clip(parts[0]);
    return component ? { name: component, recipe: null, component } : null;
  }
  if (parts.length === 2) {
    const name = clip(parts[0]);
    const component = clip(parts[1]);
    return name && component ? { name, recipe: null, component } : null;
  }
  const name = clip(parts[0]);
  const recipe = clip(parts[1]);
  const component = clip(parts[2]);
  return name && recipe && component ? { name, recipe, component } : null;
}

export function matchPurchaseQr(lines: PurchaseLine[], code: PurchaseQr) {
  const component = code.component.toLowerCase();
  const recipe = code.recipe?.toLowerCase() ?? null;
  return lines.filter((line) => {
    if (line.componentName.trim().toLowerCase() !== component) return false;
    if (!recipe) return true;
    return line.recipeId === code.recipe || line.recipeTitle.trim().toLowerCase() === recipe;
  });
}
