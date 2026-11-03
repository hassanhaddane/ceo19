/** Neon HTTP transport is deliberately limited to actual Neon endpoints and encrypted URLs. */
export function neonConnection(value:string|undefined,application=true){
 if(!value)return null;
 try{
  const url=new URL(value.trim());
  if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname.endsWith('.neon.tech')||!url.username||!url.password||url.hash||url.pathname.length<2||url.port&&url.port!=='5432'||!['require','verify-full','verify-ca'].includes(url.searchParams.get('sslmode')||''))return null;
  if(application&&decodeURIComponent(url.username)!=='ceo19_waitlist_app')return null;
  return url.toString();
 }catch{return null;}
}
