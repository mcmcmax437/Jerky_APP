import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "dark" | "light";
type Variant = "solid" | "outline";

const styles: Record<Tone, Record<Variant, string>> = {
  dark: {
    solid: "bg-ivory-100 text-text-dark hover:bg-ivory-200",
    outline: "border border-text-light/40 text-text-light hover:border-text-light",
  },
  light: {
    solid: "bg-ink-950 text-text-light hover:bg-ink-800",
    outline: "border border-ink-800/30 text-text-dark hover:border-ink-800",
  },
};

function classNames(variant: Variant, tone: Tone, className?: string) {
  return [
    "inline-flex items-center justify-center px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper",
    "disabled:cursor-not-allowed disabled:opacity-45",
    styles[tone][variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type Shared = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

export function Button(
  props: Shared &
    (
      | { href: string }
      | {
          href?: undefined;
          type?: "button" | "submit" | "reset";
          disabled?: boolean;
          onClick?: () => void;
          "aria-describedby"?: string;
        }
    ),
) {
  const variant = props.variant ?? "solid";
  const tone = props.tone ?? "dark";
  const className = classNames(variant, tone, props.className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  const button = props as Shared & {
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
    "aria-describedby"?: string;
  };

  return (
    <button
      type={button.type ?? "button"}
      className={className}
      disabled={button.disabled}
      onClick={button.onClick}
      aria-describedby={button["aria-describedby"]}
    >
      {button.children}
    </button>
  );
}
