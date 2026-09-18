import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// supabase.functions.invoke reports any non-2xx as a generic "Edge Function returned a
// non-2xx status code"; the function's own { error } message is in the response body.
export async function functionErrorMessage(err: unknown, fallback: string): Promise<string> {
  const context = (err as { context?: Response } | null)?.context;
  if (context && typeof context.json === 'function') {
    const body = await context.json().catch(() => null);
    if (body && typeof body.error === 'string') return body.error;
  }
  return err instanceof Error ? err.message : fallback;
}
