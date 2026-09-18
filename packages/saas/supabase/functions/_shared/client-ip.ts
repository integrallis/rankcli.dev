// Client IP and its salted hash, for the public tools' per-IP rate limits.
// free_audits.ip_hash stores this hash, so free-audit and
// send-free-audit-report must compute it the same way.

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
}

export async function hashIP(ip: string): Promise<string> {
  const salt = Deno.env.get('IP_SALT') || 'rankcli';
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + salt));
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
