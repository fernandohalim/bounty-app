import { createClient } from "./supabase/client";
import type { Category } from "@/lib/categories";

const DB_NAME = "bounty-queue";
const STORE = "expenses";

export type QueuedExpense = {
  client_uuid: string;
  user_id: string;
  amount: number;
  category: Category;
  note: string | null;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "client_uuid" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const r = fn(db.transaction(STORE, mode).objectStore(STORE));
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }),
  );
}

export async function enqueue(item: QueuedExpense): Promise<void> {
  await tx("readwrite", (s) => s.put(item));
  window.dispatchEvent(new Event("bounty-queue-changed"));
}

export async function queueCount(): Promise<number> {
  return tx<number>("readonly", (s) => s.count());
}

async function allItems(): Promise<QueuedExpense[]> {
  return tx<QueuedExpense[]>(
    "readonly",
    (s) => s.getAll() as IDBRequest<QueuedExpense[]>,
  );
}

async function dequeue(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

// Flush queued expenses. client_uuid + the unique(user_id, client_uuid) constraint
// make every retry idempotent — a duplicate (23505) just means it already synced.
export async function flushQueue(): Promise<void> {
  if (!navigator.onLine) return;
  const supabase = createClient();
  const items = await allItems();
  for (const it of items) {
    const { error } = await supabase.from("expenses").insert({
      user_id: it.user_id,
      amount: it.amount,
      category: it.category,
      note: it.note,
      client_uuid: it.client_uuid,
    });
    if (!error || error.code === "23505") {
      await dequeue(it.client_uuid);
    }
  }
  window.dispatchEvent(new Event("bounty-queue-changed"));
}
