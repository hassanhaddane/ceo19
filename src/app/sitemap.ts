import type {MetadataRoute} from 'next';
import {siteUrl,indexable} from '@/lib/seo';
export default function sitemap():MetadataRoute.Sitemap{return indexable?['','/press'].flatMap(path=>['en','fr'].map(locale=>({url:new URL(`/${locale}${path}`,siteUrl).href,alternates:{languages:{en:new URL(`/en${path}`,siteUrl).href,fr:new URL(`/fr${path}`,siteUrl).href}}}))):[];}
