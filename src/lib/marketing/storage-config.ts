import path from 'node:path';
import os from 'node:os';
import {neonConnection} from './neon-config.ts';

function serverlessHost(env:NodeJS.ProcessEnv){return !!(env.VERCEL||env.AWS_LAMBDA_FUNCTION_NAME||env.NETLIFY||env.FUNCTIONS_WORKER_RUNTIME);}

/** Confirmation links need a reachable public origin after deployment, not a copied preview URL. */
export function marketingPublicOrigin(env:NodeJS.ProcessEnv=process.env){
 try{
  const url=new URL(env.MARKETING_PUBLIC_URL||env.SITE_URL||'https://ceo19.ma');
  const local=url.hostname==='localhost'||url.hostname.endsWith('.localhost')||/^127\./.test(url.hostname)||url.hostname==='[::1]';
  if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))return null;
  if(local&&serverlessHost(env))return null;
  if(url.protocol!=='https:'&&!(local&&url.protocol==='http:'))return null;
  return url.origin;
 }catch{return null;}
}

/** Explicit selection: a broken remote database must never fall back to an empty local one. */
export function marketingStorageConfig(env: NodeJS.ProcessEnv = process.env) {
 const storage = env.MARKETING_STORAGE;
 if(storage==='neon'){
  const url=neonConnection(env.MARKETING_DATABASE_URL||env.DATABASE_URL);
  return url?{kind:'neon' as const,url}:null;
 }
 if (storage === 'sqlite') {
  const file = env.MARKETING_SQLITE_PATH?.trim();
  if (!file || !path.isAbsolute(file) || path.extname(file) !== '.sqlite') return null;
  const resolved = path.resolve(file);
  const inside = (base: string) => resolved === path.resolve(base) || resolved.startsWith(`${path.resolve(base)}${path.sep}`);
  const relative = path.relative(process.cwd(),resolved);
  if (['public','.next','node_modules','.git'].includes(relative.split(path.sep)[0])) return null;
  // These hosts cannot persist a local database across independent invocations/deploys.
  if (serverlessHost(env)) return null;
  if (env.NODE_ENV === 'production' && (env.MARKETING_SQLITE_PERSISTENT !== '1' || [os.tmpdir(),'/tmp','/private/tmp','/var/tmp','/private/var/tmp'].some(inside))) return null;
  return { kind: 'sqlite' as const, file: resolved };
 }
 if (storage && storage !== 'supabase') return null;
 const base = env.SUPABASE_URL?.trim();
 const key = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
 if (!base || !key || key.length < 20) return null;
 try {
  const url = new URL(base), local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || !['','/'].includes(url.pathname)) return null;
  return { kind: 'supabase' as const, base: url.origin, key };
 } catch { return null; }
}
