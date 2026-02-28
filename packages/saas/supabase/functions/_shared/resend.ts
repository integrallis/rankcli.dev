/**
 * Shared Resend Email Client
 * Used by edge functions to send transactional emails.
 */

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RESEND_API_URL = 'https://api.resend.com/emails';

// Default sender - must be from a verified domain in Resend
const DEFAULT_FROM = 'RankCLI <notifications@rankcli.dev>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        tags: options.tags,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Resend API error:', response.status, errorBody);
      return { success: false, error: `Resend API error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json() as { id: string };
    return { success: true, id: data.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Email send failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if email sending is configured
 */
export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}
