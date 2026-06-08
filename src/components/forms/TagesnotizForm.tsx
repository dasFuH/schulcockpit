"use client";

import { useRef } from "react";
import {
  FachSelect,
  AmpelRadio,
  SubmitButton,
  type FachOption,
} from "./fields";
import { createTagesnotiz, updateTagesnotiz } from "@/app/actions/notizen";
import { toDateInputValue } from "@/lib/dates";
import type { Ampel } from "@prisma/client";
import { useSheetClose } from "@/components/Sheet";

export interface TagesnotizInitial {
  id: string;
  fachId: string;
  datum: Date;
  thema: string;
  zusammenfassung: string | null;
  verstandenStatus: Ampel;
  unklarheiten: string | null;
  klassenarbeitRelevant: boolean;
}

export function TagesnotizForm({
  faecher,
  initial,
  onDone,
}: {
  faecher: FachOption[];
  initial?: TagesnotizInitial;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const closeSheet = useSheetClose();

  async function handle(formData: FormData) {
    if (initial) {
      await updateTagesnotiz(initial.id, formData);
    } else {
      await createTagesnotiz(formData);
    }
    formRef.current?.reset();
    (onDone ?? closeSheet)();
  }

  return (
    <form ref={formRef} action={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FachSelect faecher={faecher} defaultValue={initial?.fachId} />
        <div>
          <label className="label" htmlFor="datum">
            Datum
          </label>
          <input
            id="datum"
            name="datum"
            type="date"
            required
            defaultValue={
              initial ? toDateInputValue(initial.datum) : toDateInputValue(new Date())
            }
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="thema">
          Thema im Unterricht
        </label>
        <input
          id="thema"
          name="thema"
          required
          maxLength={200}
          defaultValue={initial?.thema}
          className="field"
          placeholder="z. B. Brüche kürzen"
        />
      </div>

      <AmpelRadio
        name="verstandenStatus"
        defaultValue={initial?.verstandenStatus}
        label="Wie gut verstanden?"
      />

      <div>
        <label className="label" htmlFor="zusammenfassung">
          Kurz zusammengefasst (optional)
        </label>
        <textarea
          id="zusammenfassung"
          name="zusammenfassung"
          rows={2}
          defaultValue={initial?.zusammenfassung ?? ""}
          className="field"
          placeholder="Was war das Wichtigste?"
        />
      </div>

      <div>
        <label className="label" htmlFor="unklarheiten">
          Was war unklar? (optional)
        </label>
        <textarea
          id="unklarheiten"
          name="unklarheiten"
          rows={2}
          defaultValue={initial?.unklarheiten ?? ""}
          className="field"
          placeholder="Offene Fragen…"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3">
        <input
          type="checkbox"
          name="klassenarbeitRelevant"
          defaultChecked={initial?.klassenarbeitRelevant}
          className="h-5 w-5 accent-brand"
        />
        <span className="text-sm font-medium text-indigo-800">
          🎯 Könnte für eine Klassenarbeit wichtig sein
        </span>
      </label>

      <div>
        <label className="label" htmlFor="anhang">
          Foto / Datei (optional)
        </label>
        <input
          id="anhang"
          name="anhang"
          type="file"
          accept="image/*,application/pdf"
          className="field"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
