import { getMarketingRuntime } from '@/lib/marketing/runtime';
import { marketingJson } from '@/lib/marketing/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
 const marketing = getMarketingRuntime();
 try { return marketingJson({ available: !!marketing && await marketing.repository.available() }); }
 catch { return marketingJson({ available: false }); }
}
