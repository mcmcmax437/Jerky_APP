"use client";

export function DeleteRecipeButton({
  action,
  id,
  locale,
  label,
  confirmLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  locale: string;
  label: string;
  confirmLabel: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmLabel)) event.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-red-300">
        {label}
      </button>
    </form>
  );
}
