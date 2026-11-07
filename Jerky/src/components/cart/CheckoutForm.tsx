"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Honeypot } from "@/components/security/Honeypot";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import { placeTestOrder, type CheckoutField } from "@/features/checkout/actions";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const fields = [
  ["customerName", "name", "text", true],
  ["email", "email", "email", true],
  ["phone", "phone", "text", false],
  ["country", "country", "text", false],
  ["city", "city", "text", true],
  ["postalCode", "postalCode", "text", true],
  ["addressLine", "address", "text", true],
] as const;

export function CheckoutForm({
  locale,
  dict,
  defaults,
}: {
  locale: Locale;
  dict: Dictionary;
  defaults?: { customerName: string; email: string };
}) {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [field, setField] = useState<CheckoutField | null>(null);
  const [values, setValues] = useState({
    customerName: defaults?.customerName ?? "",
    email: defaults?.email ?? "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
    addressLine: "",
    company: "",
  });

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-lg">{dict.cart.empty}</p>
        <div className="mt-8">
          <Button href={`/${locale}/shop`} tone="light">
            {dict.cart.toShop}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="relative grid max-w-xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setField(null);
        void placeTestOrder({ locale, ...values, items: lines })
          .then((result) => {
            if (!result.ok) {
              setField(result.field);
              setPending(false);
              return;
            }
            clear();
            router.push(`/${locale}/order-confirmation/${result.id}`);
          })
          .catch(() => {
            setField("items");
            setPending(false);
          });
      }}
    >
      {fields.map(([key, labelKey, type, required]) => {
        const id = `checkout-${key}`;
        const error = field === key ? dict.checkout.errors[key as CheckoutField] : null;
        return (
          <div key={key}>
            <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.16em]">
              {dict.checkout[labelKey]}
              {required ? null : <span className="ml-2 normal-case tracking-normal text-text-dark/60">{dict.checkout.optional}</span>}
            </label>
            <input
              id={id}
              name={key}
              type={type}
              required={required}
              autoComplete={key === "customerName" ? "name" : key}
              value={values[key]}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={dict.checkout.example[key === "customerName" ? "name" : key === "addressLine" ? "address" : key]}
              className="mt-2 w-full border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base outline-none placeholder:text-text-dark/40 focus-visible:border-ink-800"
            />
            {error ? (
              <p id={`${id}-error`} className="mt-2 text-sm text-chili">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
      <Honeypot id="checkout-company" value={values.company} onChange={(company) => setValues((current) => ({ ...current, company }))} />
      {field === "items" || field === "limited" ? <p className="text-sm text-chili">{dict.checkout.errors[field]}</p> : null}
      <p className="text-sm leading-relaxed text-text-dark/80">{dict.cart.note}</p>
      <Button type="submit" tone="light" disabled={pending}>
        {pending ? dict.checkout.pending : dict.checkout.submit}
      </Button>
    </form>
  );
}
