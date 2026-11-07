"use server";

import { getSession } from "@/features/auth/session";
import { prisma } from "@/lib/db/prisma";
import { buckets, clientAddress, isSpamTrap, take } from "@/lib/security/limit";
import { buildQuote, type CartLine, type Quote } from "@/features/cart/quote";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { z } from "zod";

const itemSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(20),
  size: z.enum(["50", "100", "250", "500"]).optional(),
});

const checkoutSchema = z.object({
  locale: z.enum(["pl", "uk", "en"]),
  customerName: z.string().trim().min(2).max(160),
  email: z.email().max(190),
  phone: z.string().trim().max(40),
  country: z.string().trim().max(80),
  city: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().min(2).max(20),
  addressLine: z.string().trim().min(3).max(255),
  items: z.array(itemSchema).min(1).max(20),
  company: z.string().max(200).optional(),
});

export type CheckoutField =
  | "customerName"
  | "email"
  | "city"
  | "postalCode"
  | "addressLine"
  | "items"
  | "limited";

export type CheckoutResult =
  | { ok: true; id: string; number: string }
  | { ok: false; field: CheckoutField };

async function loadQuote(locale: Locale, items: CartLine[]): Promise<Quote> {
  const slugs = [...new Set(items.map((item) => item.slug))];
  const products = await prisma.product.findMany({
    where: { published: true, slug: { in: slugs } },
    include: {
      translations: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return buildQuote(
    items,
    products.map((product) => {
      const translation =
        product.translations.find((item) => item.locale === locale) ??
        product.translations.find((item) => item.locale === "pl") ??
        product.translations[0];
      return {
        id: product.id,
        slug: product.slug,
        name: translation?.name ?? product.slug,
        netWeightG: product.netWeightG,
        priceMinor: product.priceMinor,
        currency: product.currency,
        image: product.media[0]?.publicPath ?? null,
      };
    }),
  );
}

export async function quoteCart(locale: string, items: CartLine[]): Promise<Quote> {
  if (!isLocale(locale)) {
    return { lines: [], subtotalMinor: null, totalMinor: null, currency: "PLN", pricePending: false };
  }
  const parsed = z.array(itemSchema).max(20).safeParse(items);
  if (!parsed.success) {
    return { lines: [], subtotalMinor: null, totalMinor: null, currency: "PLN", pricePending: false };
  }
  return loadQuote(locale, parsed.data);
}

function fieldFromIssue(path: PropertyKey | undefined): CheckoutField {
  if (
    path === "customerName" ||
    path === "email" ||
    path === "city" ||
    path === "postalCode" ||
    path === "addressLine" ||
    path === "items"
  ) {
    return path;
  }
  return "items";
}

export async function placeTestOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, field: fieldFromIssue(parsed.error.issues[0]?.path[0]) };
  }

  const data = parsed.data;
  const allowed = await take("checkout-ip", await clientAddress(), buckets.checkoutIp);
  if (!allowed) return { ok: false, field: "limited" };
  if (isSpamTrap(data.company)) return { ok: false, field: "items" };
  const session = await getSession();
  const quote = await loadQuote(data.locale, data.items);
  if (quote.lines.length === 0) return { ok: false, field: "items" };

  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const order = await prisma.$transaction(async (tx) => {
    const count = await tx.order.count();
    return tx.order.create({
      data: {
        number: `T-${day}-${String(count + 1).padStart(4, "0")}`,
        isTest: true,
        status: "NEW",
        locale: data.locale,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone || null,
        country: data.country || null,
        city: data.city,
        postalCode: data.postalCode,
        addressLine: data.addressLine,
        subtotalMinor: quote.subtotalMinor,
        totalMinor: quote.totalMinor,
        currency: "PLN",
        userId: session?.id,
        items: {
          create: quote.lines.map((line) => ({
            productId: line.productId,
            slug: line.slug,
            name: line.size ? `${line.name} · ${line.size} g` : line.name,
            netWeightG: line.netWeightG,
            unitPriceMinor: line.unitPriceMinor,
            quantity: line.quantity,
            lineTotalMinor: line.lineTotalMinor,
            currency: line.currency,
          })),
        },
        events: {
          create: {
            toStatus: "NEW",
            note: "Local test order. No payment and no delivery.",
          },
        },
      },
    });
  });

  return { ok: true, id: order.id, number: order.number };
}
