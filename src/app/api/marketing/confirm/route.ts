import { getMarketingRuntime } from '@/lib/marketing/runtime';
import { handleConfirm } from '@/lib/marketing/http';
export const runtime = 'nodejs';
export async function POST(request: Request) { return handleConfirm(request, getMarketingRuntime()?.service ?? null); }
