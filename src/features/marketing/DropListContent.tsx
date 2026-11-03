'use client';
import dynamic from 'next/dynamic';
import type { Locale } from '@/types/content';
const WaitlistForm = dynamic(() => import('./WaitlistForm'), { ssr: false });
/** Mounted only inside the Shop dialog; phone UI and form code stay out of Home. */
export function DropListContent({ locale }: { locale: Locale }) {
 return <div className="drop-list-content" data-waitlist-slot="connected-form"><WaitlistForm locale={locale}/></div>;
}
