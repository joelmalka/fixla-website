/**
 * Phone captured at sign-up time and applied to the user's profile after the
 * Google/Apple OAuth redirect completes. Survives the redirect via localStorage.
 */

const KEY = 'fixla.pending_phone';
const OPT_IN_KEY = 'fixla.pending_email_opt_in';

export function setPendingPhone(phone: string, emailOptIn: boolean): void {
  if (typeof window === 'undefined') return;
  if (phone) localStorage.setItem(KEY, phone);
  localStorage.setItem(OPT_IN_KEY, emailOptIn ? '1' : '0');
}

export function readPendingPhone(): { phone: string | null; emailOptIn: boolean } {
  if (typeof window === 'undefined') return { phone: null, emailOptIn: false };
  return {
    phone: localStorage.getItem(KEY),
    emailOptIn: localStorage.getItem(OPT_IN_KEY) === '1',
  };
}

export function clearPendingPhone(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(OPT_IN_KEY);
}
