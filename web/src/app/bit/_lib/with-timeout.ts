/**
 * Bricht eine Datenabfrage nach kurzer Zeit ab und liefert einen Ersatzwert.
 *
 * Die öffentlichen Seiten lesen ihre Texte und News aus Supabase, fallen aber
 * auf die eingebauten Inhalte zurück. Ohne Zeitlimit würde eine langsame oder
 * nicht erreichbare Datenbank das Rendern blockieren.
 */
export async function withTimeout<T>(
  work: () => Promise<T>,
  fallback: T,
  ms = 2000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work(),
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
