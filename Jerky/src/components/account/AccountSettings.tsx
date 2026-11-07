"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  sendSupportMessage,
  updateAccountEmail,
  updateAccountName,
  updateAccountPassword,
  type AccountField,
  type AccountResult,
} from "@/features/account/actions";
import type { Dictionary } from "@/lib/i18n/types";

type FormId = "name" | "email" | "password" | "support";
type Message = { id: string; body: string; dateLabel: string };

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-800/15 bg-white px-3 py-3 text-base text-text-dark outline-none focus-visible:border-ink-800";

export function AccountSettings({
  name,
  email,
  copy,
  pendingLabel,
  confirmLabel,
  messages,
}: {
  name: string;
  email: string;
  copy: Dictionary["account"];
  pendingLabel: string;
  confirmLabel: string;
  messages: Message[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<FormId | null>(null);
  const [saved, setSaved] = useState<FormId | null>(null);
  const [source, setSource] = useState<FormId | null>(null);
  const [field, setField] = useState<AccountField | null>(null);
  const [nameValue, setNameValue] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [emailCurrent, setEmailCurrent] = useState("");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNameValue(name);
    setEmailValue(email);
  }, [name, email]);

  const error = (key: AccountField, form: FormId) => (source === form && field === key ? copy.errors[key] : null);

  function run(id: FormId, request: Promise<AccountResult>, after?: () => void) {
    setBusy(id);
    setSaved(null);
    setField(null);
    setSource(id);
    void request
      .then((result) => {
        if (!result.ok) {
          setField(result.field);
          setBusy(null);
          return;
        }
        after?.();
        setSaved(id);
        setField(null);
        setBusy(null);
        router.refresh();
      })
      .catch(() => {
        setField("failed");
        setBusy(null);
      });
  }

  return (
    <section>
      <h2 className="font-display text-[42px] leading-[1.05] font-medium">{copy.settings}</h2>
      <p className="mt-2 max-w-xl text-base text-text-dark/75">{copy.settingsBody}</p>

      <div className="mt-6 grid max-w-xl gap-4">
        <form
          className="grid gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            run("name", updateAccountName({ name: nameValue }));
          }}
        >
          <Field id="account-name" label={copy.profileName} value={nameValue} autoComplete="name" error={error("name", "name")} onChange={setNameValue} />
          <Save pending={busy === "name"} label={copy.save} pendingLabel={pendingLabel} />
          <Status saved={saved === "name"} failed={error("failed", "name")} savedLabel={copy.savedNote} />
        </form>

        <form
          className="grid gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            run("email", updateAccountEmail({ email: emailValue, current: emailCurrent }), () => setEmailCurrent(""));
          }}
        >
          <Field id="account-email" label={copy.profileEmail} type="email" value={emailValue} autoComplete="email" error={error("email", "email") ?? error("taken", "email")} onChange={setEmailValue} />
          <Field id="account-email-current" label={copy.currentPassword} type="password" value={emailCurrent} autoComplete="current-password" error={error("current", "email")} onChange={setEmailCurrent} />
          <Save pending={busy === "email"} label={copy.save} pendingLabel={pendingLabel} />
          <Status saved={saved === "email"} failed={error("failed", "email")} savedLabel={copy.savedNote} />
        </form>

        <form
          className="grid gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            run("password", updateAccountPassword({ current, password, confirm }), () => {
              setCurrent("");
              setPassword("");
              setConfirm("");
            });
          }}
        >
          <h3 className="font-display text-[28px] leading-none font-medium">{copy.changePassword}</h3>
          <Field id="account-current" label={copy.currentPassword} type="password" value={current} autoComplete="current-password" error={error("current", "password")} onChange={setCurrent} />
          <Field id="account-password" label={copy.newPassword} type="password" value={password} autoComplete="new-password" error={error("password", "password")} onChange={setPassword} />
          <Field id="account-confirm" label={confirmLabel} type="password" value={confirm} autoComplete="new-password" error={error("confirm", "password")} onChange={setConfirm} />
          <Save pending={busy === "password"} label={copy.save} pendingLabel={pendingLabel} />
          <Status saved={saved === "password"} failed={error("failed", "password")} savedLabel={copy.savedNote} />
        </form>

        <form
          className="grid gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            run("support", sendSupportMessage({ message }), () => setMessage(""));
          }}
        >
          <h3 className="font-display text-[28px] leading-none font-medium">{copy.support}</h3>
          <p className="text-base text-text-dark/75">{copy.supportBody}</p>
          <label className="block" htmlFor="account-support">
            <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{copy.message}</span>
            <textarea id="account-support" value={message} rows={5} maxLength={2000} onChange={(event) => setMessage(event.target.value)} className={fieldClass} />
          </label>
          {error("message", "support") ? <p className="text-sm text-[#8a3b32]">{error("message", "support")}</p> : null}
          <Save pending={busy === "support"} label={copy.send} pendingLabel={pendingLabel} />
          <Status saved={saved === "support"} failed={error("failed", "support")} savedLabel={copy.sent} />
          {messages.length > 0 ? (
            <div>
              <h4 className="font-display text-[22px] leading-none font-medium">{copy.yourMessages}</h4>
              <ul className="mt-3 grid gap-2">
                {messages.map((item) => (
                  <li key={item.id} className="rounded-xl border border-ink-800/10 px-3 py-3">
                    <p className="text-sm text-text-dark/55">{item.dateLabel}</p>
                    <p className="mt-1 whitespace-pre-wrap text-base">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  error: string | null;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{label}</span>
      <input id={id} type={type} value={value} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
      {error ? <span className="mt-2 block text-sm text-[#8a3b32]">{error}</span> : null}
    </label>
  );
}

function Save({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="press w-fit bg-[#c4a574] px-6 py-3 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#2a241f] disabled:opacity-45"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function Status({ saved, failed, savedLabel }: { saved: boolean; failed: string | null; savedLabel: string }) {
  if (saved) return <p className="text-sm text-emerald-700">{savedLabel}</p>;
  if (failed) return <p className="text-sm text-[#8a3b32]">{failed}</p>;
  return null;
}
