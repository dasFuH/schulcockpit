/**
 * Kleine, wiederverwendbare Darstellungs-Bausteine (Server-tauglich).
 */
import type { Ampel } from "@prisma/client";
import { ampelBadge, ampelEmoji, ampelLabel } from "@/lib/labels";

/** Farbiger Fach-Punkt + Name. */
export function FachBadge({
  name,
  farbe,
}: {
  name: string;
  farbe: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: farbe }}
        aria-hidden
      />
      {name}
    </span>
  );
}

/** Ampel als kleiner Badge mit Text. */
export function AmpelChip({ status }: { status: Ampel }) {
  return (
    <span className={`chip ${ampelBadge[status]}`}>
      <span aria-hidden>{ampelEmoji[status]}</span>
      {ampelLabel[status]}
    </span>
  );
}

/** Leerer Zustand (freundlich, nicht wertend). */
export function EmptyState({
  emoji = "✨",
  text,
}: {
  emoji?: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
      <div className="mb-1 text-2xl">{emoji}</div>
      {text}
    </div>
  );
}

/** Abschnittsüberschrift mit optionalem Zähler. */
export function SectionTitle({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <h2 className="section-title">
      {children}
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
          {count}
        </span>
      )}
    </h2>
  );
}
