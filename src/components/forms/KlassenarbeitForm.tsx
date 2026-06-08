"use client";

import { useRef } from "react";
import {
  FachSelect,
  AmpelRadio,
  SubmitButton,
  type FachOption,
} from "./fields";
import {
  createKlassenarbeit,
  updateKlassenarbeit,
} from "@/app/actions/klassenarbeiten";
import { toDateInputValue } from "@/lib/dates";
import type { Ampel } from "@prisma/client";
import { useSheetClose } from "@/components/Sheet";

export interface KlassenarbeitInitial {
  id: string;
  fachId: string;
  datum: Date;
  titel: string;
  themen: string | null;
  materialien: string | null;
  lernstatus: Ampel;
  notiz: string | null;
}

export function KlassenarbeitForm({
  faecher,
  initial,
  onDone,
}: {
  faecher: FachOption[];
  initial?: KlassenarbeitInitial;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const closeSheet = useSheetClose();

  async function handle(formData: FormData) {
    if (initial) {
      await updateKlassenarbeit(initial.id, formData);
    } else {
      await createKlassenarbeit(formData);
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
            defaultValue={initial ? toDateInputValue(initial.datum) : ""}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="titel">
          Titel
        </label>
        <input
          id="titel"
          name="titel"
          required
          maxLength={200}
          defaultValue={initial?.titel}
          className="field"
          placeholder="z. B. Klassenarbeit Nr. 2"
        />
      </div>

      <div>
        <label className="label" htmlFor="themen">
          Themen (ein Thema pro Zeile)
        </label>
        <textarea
          id="themen"
          name="themen"
          rows={3}
          defaultValue={initial?.themen ?? ""}
          className="field"
          placeholder={"Brüche kürzen\nBrüche addieren\nTextaufgaben"}
        />
      </div>

      <AmpelRadio
        name="lernstatus"
        defaultValue={initial?.lernstatus ?? "ROT"}
        label="Lernstatus insgesamt"
      />

      <div>
        <label className="label" htmlFor="materialien">
          Materialien (optional)
        </label>
        <textarea
          id="materialien"
          name="materialien"
          rows={2}
          defaultValue={initial?.materialien ?? ""}
          className="field"
          placeholder="Heft, Arbeitsblätter, Buch S. …"
        />
      </div>

      <div>
        <label className="label" htmlFor="notiz">
          Notiz (optional)
        </label>
        <textarea
          id="notiz"
          name="notiz"
          rows={2}
          defaultValue={initial?.notiz ?? ""}
          className="field"
        />
      </div>

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
