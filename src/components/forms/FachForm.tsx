"use client";

import { useRef, useState } from "react";
import { SubmitButton } from "./fields";
import { createFach, updateFach } from "@/app/actions/faecher";
import { fachFarben } from "@/lib/labels";
import { useSheetClose } from "@/components/Sheet";

export interface FachInitial {
  id: string;
  name: string;
  farbe: string;
  lehrer: string | null;
}

export function FachForm({
  initial,
  onDone,
}: {
  initial?: FachInitial;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [farbe, setFarbe] = useState(initial?.farbe ?? fachFarben[0].wert);
  const closeSheet = useSheetClose();

  async function handle(formData: FormData) {
    if (initial) {
      await updateFach(initial.id, formData);
    } else {
      await createFach(formData);
    }
    formRef.current?.reset();
    (onDone ?? closeSheet)();
  }

  return (
    <form ref={formRef} action={handle} className="space-y-4">
      <input type="hidden" name="farbe" value={farbe} />

      <div>
        <label className="label" htmlFor="name">
          Fachname
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          defaultValue={initial?.name}
          className="field"
          placeholder="z. B. Mathe"
        />
      </div>

      <div>
        <span className="label">Farbe</span>
        <div className="flex flex-wrap gap-2">
          {fachFarben.map((f) => (
            <button
              key={f.wert}
              type="button"
              onClick={() => setFarbe(f.wert)}
              className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition ${
                farbe === f.wert ? "ring-slate-800" : "ring-transparent"
              }`}
              style={{ backgroundColor: f.wert }}
              aria-label={f.name}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="lehrer">
          Lehrer:in (optional)
        </label>
        <input
          id="lehrer"
          name="lehrer"
          maxLength={100}
          defaultValue={initial?.lehrer ?? ""}
          className="field"
          placeholder="z. B. Frau Berg"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
