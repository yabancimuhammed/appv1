// Régularité du journal — dérivée des dates de repas loggés, jamais stockée à part (voir archétype
// tracker-streak dont ce fichier reprend le pattern, adapté : ici la "série" se déduit de `meals.created_at`
// plutôt que d'une table entries dédiée).
export type DatedItem = { created_at: string }; // ISO timestamp

export function computeStreak(items: DatedItem[], today = new Date()): number {
  const days = new Set(items.map((i) => i.created_at.slice(0, 10)));
  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  const cursor = new Date(today);
  if (!days.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
