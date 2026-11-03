import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile), root = fileURLToPath(new URL('../', import.meta.url));
const ffmpeg = process.env.CEO_FFMPEG || 'ffmpeg', ffprobe = process.env.CEO_FFPROBE || 'ffprobe';
const probe = async source => JSON.parse((await execute(ffprobe, ['-v','error','-show_format','-show_streams','-of','json',source], {maxBuffer:8*1024*1024})).stdout);

/** Explicit reviewed ranges are required. Automatic time guesses are never called curated. */
export function validateWorldRanges(ranges, duration) {
 if (!Array.isArray(ranges) || ranges.length < 4 || ranges.length > 8) throw new Error('Provide 4–8 ranges after inspecting the contact sheet and the candidate footage.');
 const ids = new Set();
 for (const clip of ranges) {
  if (!/^[a-z0-9-]+$/.test(clip.id ?? '') || ids.has(clip.id)) throw new Error('Clip IDs must be unique lowercase names.');
  ids.add(clip.id);
  if (!Number.isFinite(clip.start) || !Number.isFinite(clip.duration) || clip.start < 0 || clip.duration < 3 || clip.duration > 6 || clip.start + clip.duration > duration) throw new Error(`Invalid source range: ${clip.id}`);
  if (!['reviewed','technical'].includes(clip.selection)) throw new Error(`Declare reviewed or technical selection: ${clip.id}`);
 }
 return ranges;
}

async function inspect(source, destination) {
 const metadata = await probe(source), duration = Number(metadata.format.duration);
 if (!duration || !metadata.streams.some(stream => stream.codec_type === 'video')) throw new Error('Source has no usable video duration.');
 await fs.mkdir(destination, { recursive:true });
 await fs.writeFile(path.join(destination,'source-metadata.json'), JSON.stringify(metadata,null,2));
 // Twelve evenly distributed technical samples. These are inspection material, not selected clips.
 const samples = [];
 for (let i=0;i<12;i++) {
  const time = Math.min(duration-.1, (i+.5)*duration/12), image = path.join(destination,`sample-${String(i+1).padStart(2,'0')}.jpg`);
  await execute(ffmpeg,['-hide_banner','-loglevel','error','-n','-ss',String(time),'-i',source,'-frames:v','1','-vf','scale=480:-2','-q:v','3',image]);
  samples.push({ image, sourceTime:time });
 }
 await fs.writeFile(path.join(destination,'samples.json'), JSON.stringify(samples,null,2));
 console.log(JSON.stringify({bytes:Number(metadata.format.size),duration,streams:metadata.streams.map(({codec_type,codec_name,width,height,channels,sample_rate})=>({codec_type,codec_name,width,height,channels,sample_rate})),samples},null,2));
}

async function extract(source, rangesFile) {
 const metadata = await probe(source), ranges = validateWorldRanges(JSON.parse(await fs.readFile(rangesFile,'utf8')), Number(metadata.format.duration));
 const destination = path.join(root,'public/media/world'), manifestPath = path.join(root,'src/data/worldClips.ts');
 const current = await fs.readFile(manifestPath,'utf8');
 if (!/worldClips: readonly WorldClip\[\] = \[\];/.test(current)) throw new Error('A nonempty World manifest already exists. Review it before replacing any excerpts.');
 const temporary = await fs.mkdtemp(path.join(os.tmpdir(),'ceo19-world-'));
 try {
  const manifest = [];
  for (const clip of ranges) {
   const video = path.join(temporary,`${clip.id}.mp4`), poster = path.join(temporary,`${clip.id}.jpg`);
   await execute(ffmpeg,['-hide_banner','-loglevel','error','-n','-ss',String(clip.start),'-i',source,'-t',String(clip.duration),'-map','0:v:0','-an','-sn','-dn','-map_metadata','-1','-vf',"scale='min(1280,iw)':-2,setsar=1",'-r','24','-c:v','libx264','-preset','medium','-crf','25','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-movflags','+faststart',video]);
   const result = await probe(video), stream = result.streams.find(stream=>stream.codec_type==='video');
   if (result.streams.some(stream=>stream.codec_type==='audio') || stream?.codec_name !== 'h264') throw new Error(`Invalid web export: ${clip.id}`);
   await execute(ffmpeg,['-hide_banner','-loglevel','error','-n','-ss',String(Math.min(1,clip.duration/2)),'-i',video,'-frames:v','1','-q:v','3',poster]);
   manifest.push({id:clip.id,src:`/media/world/${clip.id}.mp4`,poster:`/media/world/${clip.id}.jpg`,duration:Number(result.format.duration),sourceTime:clip.start,selection:clip.selection});
  }
  await fs.mkdir(destination,{recursive:true});
  // Refuse collisions before publishing any file; the original source is never an output target.
  for (const clip of manifest) for (const extension of ['mp4','jpg']) {
   try { await fs.access(path.join(destination,`${clip.id}.${extension}`)); throw new Error(`Output already exists: ${clip.id}.${extension}`); }
   catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  for (const clip of manifest) for (const extension of ['mp4','jpg']) await fs.copyFile(path.join(temporary,`${clip.id}.${extension}`),path.join(destination,`${clip.id}.${extension}`),fs.constants.COPYFILE_EXCL);
  const header = current.slice(0,current.indexOf('/**'));
  await fs.writeFile(manifestPath,`${header}/** Actual muted H.264 excerpts; source times refer to the preserved documentary. */\nexport const worldClips: readonly WorldClip[] = ${JSON.stringify(manifest,null,2)};\n`);
  console.log(JSON.stringify(manifest,null,2));
 } finally { await fs.rm(temporary,{recursive:true,force:true}); }
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const [mode,source,target]=process.argv.slice(2);
 if (!['inspect','extract'].includes(mode) || !source || !target) {
  console.error('Usage: node scripts/prepare-world-clips.mjs inspect <source.mov> <inspection-folder>\n       node scripts/prepare-world-clips.mjs extract <source.mov> <reviewed-ranges.json>\nOptional executable paths: CEO_FFMPEG / CEO_FFPROBE'); process.exitCode=1;
 } else {
  try { await (mode==='inspect'?inspect:extract)(path.resolve(source),path.resolve(target)); }
  catch(error) { console.error(error.code==='ENOENT'?'Source or FFmpeg/FFprobe missing. Check the supplied path and executable paths.':error.message); process.exitCode=1; }
 }
}
