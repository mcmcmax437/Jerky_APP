"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/brand/Icon";
import {
  sendSupportMessage,
  updateAccountEmail,
  updateAccountName,
  updateAccountPassword,
  type AccountField,
  type AccountResult,
} from "@/features/account/actions";
import type { Dictionary } from "@/lib/i18n/types";

type Pane = "menu" | "name" | "email" | "password" | "support";

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
  const [pane, setPane] = useState<Pane>("menu");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [field, setField] = useState<AccountField | null>(null);
  const [nameValue, setNameValue] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNameValue(name);
    setEmailValue(email);
  }, [name, email]);

  const error = (key: AccountField) => (field === key ? copy.errors[key] : null);

  function open(next: Pane) {
    setPane(next);
    setNotice(null);
    setField(null);
    setCurrent("");
    setPassword("");
    setConfirm("");
  }

  function finish(result: AccountResult, success: string, after?: () => void) {
    if (!result.ok) {
      setField(result.field);
      setPending(false);
      return;
    }
    after?.();
    setNotice(success);
    setField(null);
    setPending(false);
    setCurrent("");
    setPassword("");
    setConfirm("");
    setMessage("");
    router.refresh();
  }

  function submit(request: Promise<AccountResult>, success: string, after?: () => void) {
    setPending(true);
    setNotice(null);
    setField(null);
    void request
      .then((result) => finish(result, success, after))
      .catch(() => {
        setField("failed");
        setPending(false);
      });
  }

  return (
    <section>
      <h2 className="font-display text-[42px] leading-[1.05] font-medium">{copy.settings}</h2>
      <p className="mt-2 max-w-xl text-base text-text-dark/75">{copy.settingsBody}</p>

      {pane === "menu" ? (
        <ul className="mt-6 grid gap-3">
          <MenuRow icon="user" title={copy.profileName} hint={name} onClick={() => open("name")} />
          <MenuRow icon="mail-01" title={copy.profileEmail} hint={email} onClick={() => open("email")} />
          <MenuRow icon="square-lock-02" title={copy.changePassword} hint="••••••••" onClick={() => open("password")} />
          <MenuRow icon="message-01" title={copy.support} hint={copy.supportBody} onClick={() => open("support")} />
        </ul>
      ) : (
        <div className="mt-6 max-w-xl rounded-2xl border border-ink-800/10 bg-white/70 p-5">
          <button type="button" onClick={() => open("menu")} className="text-[13px] font-semibold tracking-[1.5px] text-text-dark/70">
            {copy.settingsBack}
          </button>

          {pane === "name" ? (
            <form
              className="mt-4 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(updateAccountName({ name: nameValue }), copy.savedNote);
              }}
            >
              <Field id="account-name" label={copy.profileName} value={nameValue} error={error("name")} onChange={setNameValue} />
              <Save pending={pending} label={copy.save} pendingLabel={pendingLabel} />
            </form>
          ) : null}

          {pane === "email" ? (
            <form
              className="mt-4 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(updateAccountEmail({ email: emailValue, current }), copy.savedNote, () => setEmailValue(emailValue.trim().toLowerCase()));
              }}
            >
              <Field id="account-email" label={copy.profileEmail} type="email" value={emailValue} autoComplete="email" error={error("email") ?? error("taken")} onChange={setEmailValue} />
              <Field id="account-email-current" label={copy.currentPassword} type="password" value={current} autoComplete="current-password" error={error("current")} onChange={setCurrent} />
              <Save pending={pending} label={copy.save} pendingLabel={pendingLabel} />
            </form>
          ) : null}

          {pane === "password" ? (
            <form
              className="mt-4 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(updateAccountPassword({ current, password, confirm }), copy.savedNote);
              }}
            >
              <Field id="account-current" label={copy.currentPassword} type="password" value={current} autoComplete="current-password" error={error("current")} onChange={setCurrent} />
              <Field id="account-password" label={copy.newPassword} type="password" value={password} autoComplete="new-password" error={error("password")} onChange={setPassword} />
              <Field id="account-confirm" label={confirmLabel} type="password" value={confirm} autoComplete="new-password" error={error("confirm")} onChange={setConfirm} />
              <Save pending={pending} label={copy.save} pendingLabel={pendingLabel} />
            </form>
          ) : null}

          {pane === "support" ? (
            <form
              className="mt-4 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(sendSupportMessage({ message }), copy.sent);
              }}
            >
              <p className="text-base text-text-dark/75">{copy.supportBody}</p>
              <p className="text-sm text-text-dark/60">{email}</p>
              <label className="block">
                <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{copy.message}</span>
                <textarea id="account-support" value={message} rows={5} maxLength={2000} onChange={(event) => setMessage(event.target.value)} className={fieldClass} />
              </label>
              {error("message") ? <p className="text-sm text-[#8a3b32]">{error("message")}</p> : null}
              <Save pending={pending} label={copy.send} pendingLabel={pendingLabel} />
              {messages.length > 0 ? (
                <div>
                  <h3 className="font-display text-[28px] leading-none font-medium">{copy.yourMessages}</h3>
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
          ) : null}

          {notice ? <p className="mt-4 text-sm text-emerald-700">{notice}</p> : null}
          {error("failed") ? <p className="mt-4 text-sm text-[#8a3b32]">{error("failed")}</p> : null}
        </div>
      )}
    </section>
  );
}

function MenuRow({ icon, title, hint, onClick }: { icon: string; title: string; hint: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl border border-ink-800/10 bg-white/70 px-4 py-4 text-left hover:bg-white">
        <Icon name={icon} size={18} />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[28px] leading-none font-medium">{title}</span>
          <span className="mt-2 block truncate text-sm text-text-dark/60">{hint}</span>
        </span>
        <span aria-hidden="true" className="text-text-dark/40">›</span>
      </button>
    </li>
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
