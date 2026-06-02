import type { Enums } from "@/types/database";

export type Category = Enums<"expense_category">;

export const CATEGORIES: {
  id: Category;
  label: string;
  emoji: string;
  accent: string;
}[] = [
  { id: "food", label: "Food", emoji: "🍜", accent: "#ff2d95" },
  { id: "transport", label: "Transport", emoji: "🚌", accent: "#2ee6ff" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", accent: "#9d5cff" },
  { id: "entertainment", label: "Fun", emoji: "🎮", accent: "#c2ff48" },
  { id: "bills", label: "Bills", emoji: "🧾", accent: "#ffcf3a" },
  { id: "health", label: "Health", emoji: "💊", accent: "#ff4d6d" },
  { id: "education", label: "Education", emoji: "📚", accent: "#2ee6ff" },
  { id: "groceries", label: "Groceries", emoji: "🛒", accent: "#c2ff48" },
  { id: "savings", label: "Savings", emoji: "🏦", accent: "#9d5cff" },
  { id: "other", label: "Other", emoji: "✨", accent: "#9b96bd" },
];

export const categoryMeta = (id: Category) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];