"use client";

import { useRef } from "react";
import { FachSelect, SubmitButton, type FachOption } from "./fields";
import {
  createHausaufgabe,
  updateHausaufgabe,
} from "@/app/actions/hausaufgaben";
import { toDateInputValue } from "@/lib/dates";

export interface HausaufgabeInitial {
  id: string;
  fachId: string;
  titel: string;
  beschreibung: string | null;
  abgabedatum: Date;
  aufwandMinuten: number | null;
  status: "OFFEN" | "ANGEFANGEN" | "ERLEDIGT";
  hilfeNoetig: boolean;
}

const aufwandOptionen = [10, 15, 20, 30, 45, 60, 90];

export function HausaufgabeForm({
  faecher,
  initial,
  onDone,
}: {
  faecher: FachOption[];
  initial?: HausaufgabeInitial;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handle(formData: FormData) {
    if (initial) {
      await updateHausaufgabe(initial.id, formData);
    } else {
      await createHausaufgabe(formData);
    }
    formRef.current?.reset();
    onDone();
  }

  return (
    <form ref={formRef} action={handle} className="space-y-4">
      <FachSelect faecher={faecher} defaultValue={initial?.fachId} />

      <div>
        <label className="label" htmlFor="titel">
          Aufgabe
        </label>
        <input
          id="titel"
          name="titel"
          required
          maxLength={200}
          defaultValue={initial?.titel}
          className="field"
          placeholder="z. B. Arbeitsblatt S. 42"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="abgabedatum">
            Abgabe
          </label>
          <input
            id="abgabedatum"
            name="abgabedatum"
            type="date"
            required
            defaultValue={
              initial ? toDateInputValue(initial.abgabedatum) : toDateInputValue(new Date())
            }
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="aufwandMinuten">
            Aufwand
          </label>
          <select
            id="aufwandMinuten"
            name="aufwandMinuten"
            defaultValue={initial?.aufwandMinuten ?? ""}
            className="field"
          >
            <option value="">—</option>
            {aufwandOptionen.map((m) => (
              <option key={m} value={m}>
                {m} Min
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "OFFEN"}
          className="field"
        >
          <option value="OFFEN">Offen</option>
          <option value="ANGEFANGEN">Angefangen</option>
          <option value="ERLEDIGT">Erledigt</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="beschreibung">
          Notiz (optional)
        </label>
        <textarea
          id="beschreibung"
          name="beschreibung"
          rows={2}
          defaultValue={initial?.beschreibung ?? ""}
          className="field"
          placeholder="Details zur Aufgabe…"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-3">
        <input
          type="checkbox"
          name="hilfeNoetig"
          defaultChecked={initial?.hilfeNoetig}
          className="h-5 w-5 accent-amber-500"
        />
        <span className="text-sm font-medium text-amber-800">
          🙋 Ich brauche Hilfe
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
