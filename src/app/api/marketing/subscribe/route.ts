import { getMarketingRuntime } from '@/lib/marketing/runtime';
import { handleSubscribe } from '@/lib/marketing/http';
export const runtime = 'nodejs';
export async function POST(request: Request) { return handleSubscribe(request, getMarketingRuntime()?.service ?? null); }
