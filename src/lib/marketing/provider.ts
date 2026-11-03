import type { MarketingProvider } from './types.ts';
/** Brevo is used only for requested confirmation messages, never automatic campaigns. */
export class BrevoMarketingProvider implements MarketingProvider {
 readonly name = 'brevo';
 private readonly key: string;
 private readonly sender: { email: string; name: string };
 private readonly transport: typeof fetch;
 constructor(key: string, sender: { email: string; name: string }, transport: typeof fetch = fetch) { this.key = key; this.sender = sender; this.transport = transport; }
 async sendEmailConfirmation(input: Parameters<MarketingProvider['sendEmailConfirmation']>[0]) {
  const fr = input.locale === 'fr';
  const subject = fr ? 'Confirmez votre choix — CEO1.9' : 'Confirm your choice — CEO1.9';
  const textContent = `${fr ? 'Confirmez les emails marketing CEO1.9 uniquement si vous avez fait cette demande.' : 'Confirm CEO1.9 marketing emails only if you requested them.'}\n\n${input.confirmUrl}\n\n${fr ? 'Sinon, ignorez ce message. Aucun email marketing avant confirmation. Désinscription :' : 'Otherwise, ignore this message. No email marketing before confirmation. Unsubscribe:'}\n${input.unsubscribeUrl}`;
  const response = await this.transport('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': this.key, 'Content-Type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ sender: this.sender, to: [{ email: input.email }], subject, textContent, headers: { 'List-Unsubscribe': `<${input.oneClickUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }), signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new Error('confirmation_delivery_failed');
  const result = await response.json() as { messageId?: unknown };
  if (typeof result.messageId !== 'string' || !result.messageId) throw new Error('confirmation_delivery_failed');
 }
}
