"use client";

import { useFormStatus } from "react-dom";
import { ampelEmoji, ampelLabel } from "@/lib/labels";
import type { Ampel } from "@prisma/client";

export interface FachOption {
  id: string;
  name: string;
  farbe: string;
}

/** Fach-Auswahl (Pflichtfeld in den meisten Formularen). */
export function FachSelect({
  faecher,
  defaultValue,
}: {
  faecher: FachOption[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor="fachId">
        Fach
      </label>
      <select
        id="fachId"
        name="fachId"
        required
        defaultValue={defaultValue ?? ""}
        className="field"
      >
        <option value="" disabled>
          Fach wählen…
        </option>
        {faecher.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Ampel-Auswahl als große, tippfreundliche Buttons (Radio). */
export function AmpelRadio({
  name,
  defaultValue = "GELB",
  label = "Verständnis",
}: {
  name: string;
  defaultValue?: Ampel;
  label?: string;
}) {
  const optionen: Ampel[] = ["GRUEN", "GELB", "ROT"];
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {optionen.map((opt, i) => (
          <label
            key={opt}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5"
          >
            <input
              type="radio"
              name={name}
              value={opt}
              defaultChecked={defaultValue ? defaultValue === opt : i === 1}
              className="sr-only"
            />
            <span className="text-xl">{ampelEmoji[opt]}</span>
            <span>{ampelLabel[opt]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Absende-Button mit Lade-Zustand. */
export function SubmitButton({ label = "Speichern" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Speichere…" : label}
    </button>
  );
}
