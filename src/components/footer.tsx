import Link from 'next/link';
import type { Locale } from '@/types/content';
import type { Dictionary } from '@/i18n/dictionaries';
export function Footer({locale,copy}:{locale:Locale;copy:Dictionary}) {return <footer className="site-footer"><div className="night-footer"><a href={`/${locale}#home`}>CEO 1.9</a><span>FEZ → WORLD / SIGNAL 1.9</span><Link href={`/${locale}/press`}>{copy.press}</Link><span>© {new Date().getUTCFullYear()} CEO 1.9</span></div></footer>;}
