'use client';
import { NavigationAction } from '@/components/interactive/NavigationAction';
import { UtilityButton } from '@/components/interactive/UtilityAction';
import { ShopAction } from '@/components/interactive/ShopAction';
import { useEffect, useState, useMemo, type FormEvent } from 'react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';
import { CONSENT_VERSION, consentText, marketingCopy } from '@/data/marketing';
import type { Locale } from '@/types/content';
import type { StoredResult } from '@/lib/marketing/types';

export default function WaitlistForm({ locale }: { locale: Locale }) {
 const copy = marketingCopy[locale];
 const [available, setAvailable] = useState<boolean | null>(null);
 const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
 const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
 const [result, setResult] = useState<StoredResult | null>(null);
 const [phoneOpen, setPhoneOpen] = useState(false);
 const [emailConsent, setEmailConsent] = useState(false), [smsConsent, setSmsConsent] = useState(false);
 const countries = useMemo(() => {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  return getCountries().map(code => ({ code, name: names.of(code) || code, prefix: getCountryCallingCode(code) })).sort((a,b) => a.name.localeCompare(b.name, locale));
 }, [locale]);
 useEffect(() => {
  const controller = new AbortController();
  fetch('/api/marketing/status', { cache: 'no-store', signal: controller.signal }).then(async response => { const data = await response.json(); setAvailable(response.ok && data.available === true); }).catch(() => { if (!controller.signal.aborted) setAvailable(false); });
  return () => controller.abort();
 }, [availabilityAttempt]);
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); if (submitting || available !== true) return;
  setError('');
  if (!emailConsent && !smsConsent) { setError(copy.no_consent); return; }
  const form = event.currentTarget, data = new FormData(form);
  const email = String(data.get('email') || ''), phone = String(data.get('phone') || '');
  if (emailConsent && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) { setError(copy.invalid_email); return; }
  if (smsConsent && !phone.trim()) { setPhoneOpen(true); setError(copy.invalid_phone); requestAnimationFrame(() => document.getElementById('drop-phone')?.focus()); return; }
  setSubmitting(true);
  try {
   const response = await fetch('/api/marketing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailConsent ? email : '', phone: smsConsent ? phone : '', country: smsConsent ? data.get('country') : '', emailConsent, smsConsent, consentVersion: CONSENT_VERSION, source: 'shop_waitlist', locale, website: data.get('website') || '' }) });
   const body = await response.json();
   if (!response.ok || body.stored !== true || !['sent','pending','not_requested'].includes(body.emailConfirmation) || !['pending','not_requested'].includes(body.smsVerification)) {
    const key = body.error as keyof typeof copy;
    setError(typeof copy[key] === 'string' && ['invalid_email','invalid_phone','no_consent','outdated_consent','rate_limited','unavailable','storage_error','invalid_request'].includes(key) ? copy[key] : copy.storage_error);
    return;
   }
   form.reset(); setEmailConsent(false); setSmsConsent(false); setResult(body as StoredResult);
  } catch { setError(copy.network_error); }
  finally { setSubmitting(false); }
 }
 if (result) return <div className="waitlist-result" role="status"><h3>{copy.stored}</h3>{result.emailConfirmation !== 'not_requested' && <p>{result.emailConfirmation === 'sent' ? copy.confirmation_sent : copy.confirmation_pending}</p>}{result.smsVerification === 'pending' && <p>{copy.sms_pending}</p>}<NavigationAction className="waitlist-result-privacy" href={`/${locale}/shop/privacy`} target="_blank" rel="noopener noreferrer">{copy.privacy}</NavigationAction></div>;
 return <form className="waitlist-form" onSubmit={submit} noValidate aria-busy={submitting}>
  <div className="waitlist-field"><label htmlFor="drop-email">{copy.email}</label><input id="drop-email" name="email" type="email" disabled={submitting} aria-invalid={error === copy.invalid_email} autoComplete="email" inputMode="email" maxLength={254} aria-describedby={`drop-email-note${error === copy.invalid_email ? ' drop-form-error' : ''}`} aria-required={emailConsent}/><span id="drop-email-note" className="waitlist-field-note" hidden={!smsConsent}>{copy.optionalEmail}</span></div>
  <details className="waitlist-phone" open={phoneOpen} onToggle={event => setPhoneOpen(event.currentTarget.open)}><summary tabIndex={0}>{copy.phone}<span aria-hidden="true" className="waitlist-phone-mark"/></summary><div className="waitlist-phone-grid"><div className="waitlist-field"><label htmlFor="drop-country">{copy.country}</label><select id="drop-country" name="country" disabled={submitting} defaultValue=""><option value="">{copy.international}</option>{countries.map(country => <option key={country.code} value={country.code}>{country.name} (+{country.prefix})</option>)}</select></div><div className="waitlist-field"><label htmlFor="drop-phone">{copy.phone}</label><input id="drop-phone" name="phone" type="tel" disabled={submitting} aria-invalid={error === copy.invalid_phone} autoComplete="tel" inputMode="tel" maxLength={64} aria-required={smsConsent} aria-describedby={error === copy.invalid_phone ? 'drop-form-error' : undefined}/></div></div>
  <p className="waitlist-field-note">{copy.notice}</p></details>
  <div className="waitlist-honeypot" aria-hidden="true"><label>{copy.honeypot}<input name="website" autoComplete="off" tabIndex={-1}/></label></div>
  <fieldset className="waitlist-consents"><legend className="sr-only">{locale === 'fr' ? 'Choix des canaux marketing' : 'Marketing channel choices'}</legend><label><input type="checkbox" name="emailConsent" disabled={submitting} checked={emailConsent} onChange={event => setEmailConsent(event.target.checked)}/><span>{consentText[locale].email}</span></label><label><input type="checkbox" name="smsConsent" disabled={submitting} checked={smsConsent} onChange={event => { setSmsConsent(event.target.checked); if (event.target.checked) setPhoneOpen(true); }}/><span>{consentText[locale].sms}</span></label></fieldset>
  <p className="waitlist-purpose">{copy.compactPurpose} <NavigationAction href={`/${locale}/shop/privacy`} target="_blank" rel="noopener noreferrer">{copy.privacy}</NavigationAction></p>
  {available !== true && <div className="waitlist-availability"><p role="status">{available === null ? copy.checking : copy.unavailable}</p>{available === false && <UtilityButton className="waitlist-retry" onClick={() => { setAvailable(null); setAvailabilityAttempt(value => value + 1); }}>{copy.retryAvailability}</UtilityButton>}</div>}
  {error && <p id="drop-form-error" className="waitlist-error" role="alert">{error}</p>}
  <ShopAction className="waitlist-submit" type="submit" disabled={submitting || available !== true}>{submitting ? copy.sending : locale === 'fr' ? 'REJOINDRE' : 'JOIN LIST'}</ShopAction>
 </form>;
}
