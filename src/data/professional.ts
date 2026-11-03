import type { ProfessionalContact } from '@/types/content';
import { assets } from './assets.ts';
export const professional: ProfessionalContact = {
 // Publication allowlist: add only explicitly approved, descriptively named press files.
 // The historical inventory names an EPK, but the actual PDF is absent from this checkout.
 email: 'CEO1.9CONTACT@GMAIL.COM', epk: assets.epk, pressImages: [],
 services: { en: ['Press & interviews', 'Live bookings', 'Creative partnerships'], fr: ['Presse et interviews', 'Programmation live', 'Partenariats créatifs'] }
};
