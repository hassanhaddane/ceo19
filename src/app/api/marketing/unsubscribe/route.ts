import { getMarketingRuntime } from '@/lib/marketing/runtime';
import { handleUnsubscribe } from '@/lib/marketing/http';
export const runtime = 'nodejs';
export async function POST(request: Request) { return handleUnsubscribe(request, getMarketingRuntime()?.service ?? null); }
