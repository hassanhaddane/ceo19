/** SQLite migration 1. Applied transactionally; never placed in public/. */
export const SQLITE_SCHEMA_VERSION = 1;
export const SQLITE_SCHEMA = `
CREATE TABLE marketing_consent_versions (
 version TEXT NOT NULL, locale TEXT NOT NULL CHECK(locale IN ('en','fr')),
 channel TEXT NOT NULL CHECK(channel IN ('email','sms')), consent_text TEXT NOT NULL,
 PRIMARY KEY(version,locale,channel)
) STRICT;
CREATE TABLE marketing_contacts (
 id TEXT PRIMARY KEY NOT NULL,
 channel TEXT NOT NULL CHECK(channel IN ('email','sms')),
 email TEXT UNIQUE, phone_e164 TEXT UNIQUE,
 email_consent INTEGER NOT NULL DEFAULT 0 CHECK(email_consent IN (0,1)),
 sms_consent INTEGER NOT NULL DEFAULT 0 CHECK(sms_consent IN (0,1)),
 email_consent_at INTEGER, sms_consent_at INTEGER,
 consent_text_version TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'shop_waitlist' CHECK(source='shop_waitlist'),
 locale TEXT NOT NULL CHECK(locale IN ('en','fr')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','suppressed')),
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 confirmed_at INTEGER, unsubscribed_email_at INTEGER, unsubscribed_sms_at INTEGER,
 confirmation_token_hash TEXT UNIQUE, confirmation_expires_at INTEGER,
 confirmation_delivery TEXT NOT NULL DEFAULT 'pending' CHECK(confirmation_delivery IN ('pending','accepted','failed','unconfigured')),
 CHECK((channel='email' AND email IS NOT NULL AND phone_e164 IS NULL AND sms_consent=0 AND sms_consent_at IS NULL)
 OR(channel='sms' AND phone_e164 IS NOT NULL AND email IS NULL AND email_consent=0 AND email_consent_at IS NULL)),
 CHECK(email IS NULL OR(email=lower(trim(email)) AND length(email)<=254 AND instr(email,'@')>1)),
 CHECK(phone_e164 IS NULL OR(substr(phone_e164,1,1)='+' AND substr(phone_e164,2,1) BETWEEN '1' AND '9' AND length(phone_e164) BETWEEN 8 AND 16 AND substr(phone_e164,2) NOT GLOB '*[^0-9]*')),
 CHECK(email_consent=0 OR email_consent_at IS NOT NULL),
 CHECK(sms_consent=0 OR sms_consent_at IS NOT NULL),
 CHECK(status<>'confirmed' OR confirmed_at IS NOT NULL)
) STRICT;
CREATE INDEX marketing_pending_updated ON marketing_contacts(updated_at) WHERE status='pending';
CREATE TABLE marketing_consent_events (
 id TEXT PRIMARY KEY NOT NULL, contact_id TEXT NOT NULL REFERENCES marketing_contacts(id) ON DELETE CASCADE,
 channel TEXT NOT NULL CHECK(channel IN ('email','sms')),
 event TEXT NOT NULL CHECK(event IN ('opt_in_requested','email_confirmed','unsubscribed','pending_expired')),
 consent INTEGER NOT NULL CHECK(consent IN (0,1)), occurred_at INTEGER NOT NULL,
 consent_text_version TEXT NOT NULL, consent_text TEXT NOT NULL, locale TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source='shop_waitlist')
) STRICT;
CREATE INDEX marketing_events_contact_time ON marketing_consent_events(contact_id,occurred_at);
CREATE TABLE marketing_rate_limits (
 key TEXT NOT NULL, window_start INTEGER NOT NULL, hits INTEGER NOT NULL CHECK(hits>0), PRIMARY KEY(key,window_start)
) STRICT;
CREATE INDEX marketing_rate_expiry ON marketing_rate_limits(window_start);
CREATE VIEW marketing_email_audience AS
 SELECT id,email,locale FROM marketing_contacts WHERE channel='email' AND status='confirmed' AND email_consent=1
 AND(unsubscribed_email_at IS NULL OR confirmed_at>unsubscribed_email_at);
CREATE VIEW marketing_sms_audience AS
 SELECT id,phone_e164,locale FROM marketing_contacts WHERE channel='sms' AND status='confirmed' AND sms_consent=1
 AND(unsubscribed_sms_at IS NULL OR confirmed_at>unsubscribed_sms_at);
`;
