/**
 * Safe link generation and navigation utilities for emails and external websites.
 */

export function getCleanDomain(domainOrCompany?: string): string {
  if (!domainOrCompany) return '';
  let clean = domainOrCompany.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.replace(/\/.*$/, '');
  return clean;
}

export function getCompanyWebsiteUrl(companyDomain?: string, companyName?: string): string {
  if (companyDomain && companyDomain.trim().length > 0) {
    const clean = getCleanDomain(companyDomain);
    return `https://${clean}`;
  }

  if (companyName && companyName.trim().length > 0) {
    // Generate clean domain from company name
    const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://${sanitized}.com`;
  }

  return 'https://google.com';
}

export function getMailtoUrl(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ''}`;
}

export function getGmailComposeUrl(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email
  });
  if (subject) params.append('su', subject);
  if (body) params.append('body', body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function getOutlookComposeUrl(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams({
    to: email
  });
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

export function openExternalUrl(url: string): void {
  if (!url) return;
  try {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')
      ? url
      : `https://${url}`;
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error('Failed to open external url:', err);
  }
}
