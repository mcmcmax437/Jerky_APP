"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loginAccount, registerAccount, type AuthField } from "@/features/auth/actions";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function AuthForm({
  mode,
  locale,
  dict,
  next,
}: {
  mode: "login" | "register";
  locale: Locale;
  dict: Dictionary;
  next?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [field, setField] = useState<AuthField | null>(null);
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });

  const error = (key: AuthField) => (field === key ? dict.auth.errors[key] : null);

  return (
    <form
      className="grid max-w-xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setField(null);
        const payload = { locale, ...values, next };
        const request = mode === "login" ? loginAccount(payload) : registerAccount(payload);
        void request
          .then((result) => {
            if (!result.ok) {
              setField(result.field);
              setPending(false);
              return;
            }
            router.push(result.href);
            router.refresh();
          })
          .catch(() => {
            setField("failed");
            setPending(false);
          });
      }}
    >
      {mode === "register" ? (
        <Field
          id="auth-name"
          label={dict.auth.name}
          type="text"
          autoComplete="name"
          value={values.name}
          placeholder={dict.auth.example.name}
          error={error("name")}
          onChange={(name) => setValues((current) => ({ ...current, name }))}
        />
      ) : null}
      <Field
        id="auth-email"
        label={dict.auth.email}
        type="email"
        autoComplete="email"
        value={values.email}
        placeholder={dict.auth.example.email}
        error={error("email") ?? error("taken")}
        onChange={(email) => setValues((current) => ({ ...current, email }))}
      />
      <Field
        id="auth-password"
        label={dict.auth.password}
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={values.password}
        placeholder={dict.auth.example.password}
        error={error("password")}
        onChange={(password) => setValues((current) => ({ ...current, password }))}
      />
      {mode === "register" ? (
        <Field
          id="auth-confirm"
          label={dict.auth.confirm}
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          error={error("confirm")}
          onChange={(confirm) => setValues((current) => ({ ...current, confirm }))}
        />
      ) : null}
      {field === "credentials" || field === "failed" || field === "banned" ? (
        <p className="text-sm text-chili">{dict.auth.errors[field]}</p>
      ) : null}
      <Button type="submit" tone="light" disabled={pending}>
        {pending ? dict.auth.pending : mode === "login" ? dict.auth.submitLogin : dict.auth.submitRegister}
      </Button>
      <p className="text-sm">
        {mode === "login" ? (
          <Link href={`/${locale}/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="underline">
            {dict.auth.needAccount}
          </Link>
        ) : (
          <Link href={`/${locale}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="underline">
            {dict.auth.haveAccount}
          </Link>
        )}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  value: string;
  error: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.16em]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base outline-none placeholder:text-text-dark/40 focus-visible:border-ink-800"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-chili">
          {error}
        </p>
      ) : null}
    </div>
  );
}
