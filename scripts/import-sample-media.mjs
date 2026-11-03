/**
 * S00 restricted operator importer. NEVER place the service-role key in client code.
 * node scripts/import-sample-media.mjs --manifest manifests/s00-media-sample.json --report /tmp/s00-report.json [--execute]
 * No --execute: validation-only; requires no privileged key.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';

const LIMIT=12*1024*1024;
const MIME={jpg:'image/jpeg',png:'image/png',webp:'image/webp'};
function fail(message){throw new Error(message);}
function parseArgs(argv){
  const opts={execute:false};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--execute')opts.execute=true;
    else if(argv[i]==='--manifest'||argv[i]==='--report')opts[argv[i].slice(2)]=argv[++i];
    else fail('Unexpected option: '+argv[i]);
  }
  if(!opts.manifest||!opts.report)fail('--manifest and --report are required');
  return opts;
}
function imageKind(bytes){
  if(bytes.length>=3&&bytes.subarray(0,3).equals(Buffer.from([255,216,255])))return 'jpg';
  if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
  if(bytes.length>=12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'webp';
  fail('Invalid image bytes: only JPEG, PNG and WebP supported');
}
async function readImage(item,allowedHosts){
  if(item.sourceFile){
    const root=process.cwd(),file=resolve(root,item.sourceFile),rel=relative(root,file);
    if(rel.startsWith('..')||rel.startsWith('/')||!(rel.startsWith('src/assets/images/')||rel.startsWith('public/assets/')))fail('Source outside permitted app asset folders');
    const bytes=await readFile(file);
    if(bytes.length>LIMIT)fail('Image exceeds 12 MiB');
    return bytes;
  }
  const url=new URL(item.sourceUrl);
  if(url.protocol!=='https:'||url.username||url.password||url.port||!allowedHosts.includes(url.hostname))fail('Unapproved remote image origin');
  const res=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(25000)});
  if(!res.ok)fail('Image fetch HTTP '+res.status);
  if(Number(res.headers.get('content-length')||0)>LIMIT)fail('Image exceeds 12 MiB');
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length>LIMIT)fail('Image exceeds 12 MiB');
  return bytes;
}
const opts=parseArgs(process.argv.slice(2));
const manifest=JSON.parse(await readFile(opts.manifest,'utf8'));
if(!/^[a-z0-9][a-z0-9_-]{2,70}$/.test(manifest.importId||''))fail('Invalid importId');
if(!Array.isArray(manifest.items)||!manifest.items.length||!Array.isArray(manifest.allowedImageHosts))fail('Invalid manifest');
if(!manifest.allowedImageHosts.every(h=>/^[a-zA-Z0-9.-]+$/.test(h)))fail('Invalid allowlisted host');
const domains=new Set(['d02_profile','d05_place','d06_trail','d07_guardian','d09_business','d12_social']);
const seen=new Set();
for(const item of manifest.items){
  if(typeof item.sourceRef!=='string'||!item.sourceRef.startsWith('src/')||seen.has(item.sourceRef))fail('Invalid/duplicate sourceRef');
  seen.add(item.sourceRef);
  if(!/^[a-zA-Z0-9_-]{3,100}$/.test(item.ownerLegacyId||'')||item.ownerLegacyId==='usr_hannibal_1337')fail('Missing or forbidden test owner');
  if(!domains.has(item.domain)||Boolean(item.sourceFile)===Boolean(item.sourceUrl))fail('Invalid domain/source');
}
let client;
if(opts.execute){
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)||!key)fail('Server-only Supabase URL and service-role key required');
  const {createClient}=await import('@supabase/supabase-js');
  client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
const report={schemaVersion:1,importId:manifest.importId,bucket:'media',sourceCommit:manifest.sourceCommit||null,executed:opts.execute,items:[]};
let failures=0;
for(const item of manifest.items){
  const row={sourceRef:item.sourceRef,sourceFile:item.sourceFile||null,sourceUrl:item.sourceUrl||null,ownerLegacyId:item.ownerLegacyId,domain:item.domain,importId:manifest.importId,bucket:'media',status:'pending'};
  try{
    const bytes=await readImage(item,manifest.allowedImageHosts);
    const kind=imageKind(bytes),digest=createHash('sha256').update(bytes).digest('hex');
    const path='imports/'+manifest.importId+'/'+digest+'.'+kind;
    Object.assign(row,{objectKey:path,sha256:digest,size:bytes.length,mimeType:MIME[kind],status:'validated'});
    if(opts.execute){
      const store=client.storage.from('media');
      const {error}=await store.upload(path,bytes,{upsert:false,contentType:MIME[kind],cacheControl:'3600'});
      if(error&&!/already exists|duplicate|409/i.test(error.message||''))fail('Upload failed: '+error.message);
      const downloaded=await store.download(path);
      if(downloaded.error||!downloaded.data)fail('Readback failed: '+(downloaded.error?.message||'no data'));
      const actual=createHash('sha256').update(Buffer.from(await downloaded.data.arrayBuffer())).digest('hex');
      if(actual!==digest)fail('Storage checksum mismatch');
      row.status=error?'existing_verified':'uploaded_verified';
    }
  }catch(e){row.status='failed';row.error=String(e.message||e);failures++;}
  report.items.push(row);
  console.log(row.status+': '+item.sourceRef);
}
report.failures=failures;
report.complete=opts.execute&&failures===0;
await writeFile(opts.report,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
console.log('Report: '+opts.report);
if(failures)process.exitCode=1;
