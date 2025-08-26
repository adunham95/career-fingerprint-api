export function getDomainFromEmail(email: string): string | null {
  if (!email.includes('@')) return null;
  const [, domain] = email.split('@');
  return domain || null;
}
