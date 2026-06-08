"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

const SheetCloseContext = createContext<() => void>(() => {});

export function useSheetClose(): () => void {
  return useContext(SheetCloseContext);
}

/**
 * Mobile Bottom-Sheet mit Auslöse-Button (FAB oder normaler Button).
 * Schließt automatisch, nachdem das enthaltene Formular erfolgreich
 * abgeschickt wurde (über useSheetClose im enthaltenen Client-Formular).
 *
 * Verwendung:
 *   <Sheet trigger="+ Neu" title="Hausaufgabe">
 *     <MeinFormular />
 *   </Sheet>
 */
export function Sheet({
  trigger,
  title,
  children,
  fab = false,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  fab?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Body-Scroll sperren, solange das Sheet offen ist
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          fab
            ? "fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-3xl text-white shadow-lg active:scale-95"
            : "btn-primary"
        }
        aria-label={typeof trigger === "string" ? trigger : title}
      >
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                type="button"
                onClick={close}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            <SheetCloseContext.Provider value={close}>
              {children}
            </SheetCloseContext.Provider>
          </div>
        </div>
      )}
    </>
  );
}
