"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { enqueue } from "@/lib/offline-queue";
import { CategorySelect } from "@/components/ui/category-select";
import { DateTimePicker } from "@/components/ui/datetime-picker";

type Mode = "oneoff" | "recurring";
const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "000", "0", "del"];

const Ctx = createContext<{
  open: () => void;
  close: () => void;
  isOpen: boolean;
} | null>(null);

export function useAddSheet() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAddSheet must be used inside <AddSheetProvider>");
  return c;
}

export function AddSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Ctx.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function AddExpenseOverlay() {
  const { isOpen, close } = useAddSheet();
  const [render, setRender] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        setRender(true);
        raf2 = requestAnimationFrame(() => setShow(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    // closing: animate out in a callback, then unmount after the transition
    const raf = requestAnimationFrame(() => setShow(false));
    const t = setTimeout(() => setRender(false), 280); // > the 260ms sheet transition
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!render) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [render]);

  if (!render) return null;
  return <Sheet show={show} onClose={close} />;
}

function Sheet({ show, onClose }: { show: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("oneoff");
  const [digits, setDigits] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "monthly">("monthly");
  const [when, setWhen] = useState<Date>(() => new Date());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = parseInt(digits || "0", 10);
  const canSave = amount > 0 && !!category && !saving;

  function press(key: string) {
    setErr(null);
    if (key === "del") return setDigits((d) => d.slice(0, -1));
    if (key === "000")
      return setDigits((d) => (d === "" ? "" : (d + "000").slice(0, 12)));
    setDigits((d) => (d === "" && key === "0" ? "" : (d + key).slice(0, 12)));
  }

  function done() {
    onClose();
    router.refresh();
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setErr(null);
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (!userId) return router.replace("/login");

    const clientUuid = crypto.randomUUID();
    const base = {
      user_id: userId,
      amount,
      category: category!,
      note: note.trim() || null,
    };

    if (!navigator.onLine) {
      if (mode === "recurring") {
        setErr("You're offline — scheduling needs a connection.");
        setSaving(false);
        return;
      }
      await enqueue({
        client_uuid: clientUuid,
        spent_at: when.toISOString(),
        ...base,
      });
      done();
      return;
    }

    const { error } =
      mode === "oneoff"
        ? await supabase.from("expenses").insert({
            ...base,
            client_uuid: clientUuid,
            spent_at: when.toISOString(),
          })
        : await supabase.from("recurring_expenses").insert({
            ...base,
            cadence,
            next_occurrence: when.toISOString().slice(0, 10),
          });

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }
    done();
  }

  return (
    <div className="fixed inset-0 z-60">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-void/70 backdrop-blur-sm transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 mx-auto flex h-dvh w-full max-w-md flex-col bg-void transition-transform duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] ${show ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-lg text-ink-dim active:scale-90"
          >
            ×
          </button>
          <div className="flex rounded-pill border border-line bg-surface p-1">
            {(["oneoff", "recurring"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-pill px-4 py-1.5 text-xs font-mono transition ${mode === m ? "bg-neon-cyan text-void" : "text-ink-dim"}`}
              >
                {m === "oneoff" ? "one-off" : "recurring"}
              </button>
            ))}
          </div>
          <div className="w-9" />
        </div>

        {/* body — never scrolls; popovers float instead of expanding layout */}
        <div className="flex flex-1 flex-col gap-3 px-5 pt-4">
          <div className="surface-card flex items-center justify-center gap-2 py-5">
            <span className="text-2xl">🪙</span>
            <span className="font-mono text-4xl font-bold text-neon-lime">
              {formatCoins(amount)}
            </span>
          </div>

          <CategorySelect value={category} onChange={setCategory} />

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            maxLength={140}
            className="rounded-pill border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/50 "
          />

          {mode === "recurring" && (
            <div className="flex rounded-pill border border-line bg-surface p-1">
              {(["weekly", "monthly"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`flex-1 rounded-pill py-2 text-xs font-mono font-bold lowercase transition ${cadence === c ? "bg-neon-violet text-void" : "text-ink-dim"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <DateTimePicker
            value={when}
            onChange={setWhen}
            mode={mode === "recurring" ? "date" : "datetime"}
            label={mode === "recurring" ? "Starts" : "When"}
          />

          {err && <p className="text-center text-sm text-over">{err}</p>}
        </div>

        {/* footer — pinned keypad + save */}
        <div className="flex flex-col gap-2 px-5 pb-6 pt-2">
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                className="rounded-card border border-line bg-surface py-3.5 font-mono text-xl font-bold text-ink transition active:scale-95 active:bg-surface-2"
              >
                {k === "del" ? "⌫" : k}
              </button>
            ))}
          </div>
          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-pill bg-neon-lime py-3.5 font-display font-bold text-void shadow-glow-lime transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            {saving
              ? "Saving…"
              : mode === "oneoff"
                ? "Log it →"
                : "Schedule it →"}
          </button>
        </div>
      </div>
    </div>
  );
}
