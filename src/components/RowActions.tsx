"use client";

import { useState } from "react";

/**
 * Löschen-Button mit kurzer Bestätigung (zwei-Stufen, kein nerviges confirm()).
 * `action` ist eine gebundene Server Action (z. B. deleteX.bind(null, id)).
 */
export function DeleteButton({
  action,
  label = "Löschen",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-sm text-slate-400 hover:text-red-600"
      >
        🗑
      </button>
    );
  }

  return (
    <form action={action} className="inline-flex items-center gap-1">
      <button type="submit" className="text-sm font-medium text-red-600">
        {label}?
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-sm text-slate-400"
      >
        Abbr.
      </button>
    </form>
  );
}

/**
 * Schnell-Button, der eine gebundene Server Action ausführt
 * (z. B. Status setzen). Optisch als Chip.
 */
export function QuickAction({
  action,
  children,
  active = false,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={`chip transition ${
          active
            ? "bg-brand text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {children}
      </button>
    </form>
  );
}
