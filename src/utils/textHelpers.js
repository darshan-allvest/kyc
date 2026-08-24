/**
 * Text helpers shared by the theme components copied from the main app.
 */

/** "OPEN YOUR ACCOUNT" → "Open your account" (keeps "Allvest" capitalised). */
export const toSentenceCase = (str = '') => {
  if (typeof str !== 'string' || !str) return str;
  const lower = str.toLowerCase();
  const sentence = lower.charAt(0).toUpperCase() + lower.slice(1);
  return sentence.replace(/allvest/g, 'Allvest');
};

/** rahul.sharma@example.com → rah****@example.com */
export const maskEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length < 3) return email;
  return `${local.substring(0, 3)}****@${domain}`;
};
