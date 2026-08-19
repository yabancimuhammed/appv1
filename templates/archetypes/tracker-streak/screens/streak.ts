// Calcul du streak — dérivé des entries, jamais stocké à part (voir README.md).
// Renomme/adapte si le domaine réel a une logique différente (ex. streak hebdo plutôt que quotidien).

export type Entry = { done_on: string }; // "YYYY-MM-DD"

/** Nombre de jours consécutifs jusqu'à aujourd'hui (ou hier si pas encore fait aujourd'hui), sans trou. */
export function computeStreak(entries: Entry[], today = new Date()): number {
  const days = new Set(entries.map((e) => e.done_on));
  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  let cursor = new Date(today);
  if (!days.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // pas encore fait aujourd'hui : on part d'hier
  }

  let streak = 0;
  while (days.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
