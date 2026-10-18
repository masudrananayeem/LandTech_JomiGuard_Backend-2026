import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  APP_ENV: string; CORS_ORIGINS: string;
  CLOUDINARY_CLOUD_NAME: string; CLOUDINARY_API_KEY: string; CLOUDINARY_API_SECRET: string;
  FIREBASE_WEB_API_KEY: string;
};
const app = new Hono<{ Bindings: Env }>();
const demoCases = [
  {id:'JG-DEMO-001',title:'Consistent sample record',district:'Bogura',upazila:'Shibganj',mouza:'Demo Mouza A (fictional)',dagNo:'125',khatianNo:'789',expectedRisk:'low'},
  {id:'JG-DEMO-002',title:'Area and date need review',district:'Rajshahi',upazila:'Paba',mouza:'Demo Mouza B (fictional)',dagNo:'442',khatianNo:'1102',expectedRisk:'moderate'},
  {id:'JG-DEMO-003',title:'Conflicting owner and plot details',district:'Bogura',upazila:'Shibganj',mouza:'Demo Mouza C (fictional)',dagNo:'126',khatianNo:'790',expectedRisk:'critical'},
  {id:'JG-DEMO-004',title:'Inheritance share needs review',district:'Cumilla',upazila:'Daudkandi',mouza:'Demo Mouza D (fictional)',dagNo:'87',khatianNo:'320',expectedRisk:'high'}
];
app.use('*', async (c, next) => {
  const allowed = (c.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(x=>x.trim());
  const origin = c.req.header('Origin') || '';
  if (origin && !allowed.includes(origin)) return c.json({error:'Origin not allowed'}, 403);
  await next();
});
app.use('*', cors({origin:(origin,c)=> (c.env.CORS_ORIGINS||'').split(',').map(x=>x.trim()).includes(origin)?origin:'',allowMethods:['GET','POST','OPTIONS'],allowHeaders:['Content-Type','Authorization']}));
app.get('/', c=>c.json({service:'JomiGuard BD API',status:'ok',docs:'See README.md; sample data is fictional.'}));
app.get('/api/health', c=>c.json({status:'ok',service:'JomiGuard BD API',mode:'synthetic-demo',governmentApiConnected:false}));
app.get('/api/cases', c=>c.json(demoCases));
app.get('/api/cases/:id', c=>{const item=demoCases.find(x=>x.id===c.req.param('id')); return item?c.json(item):c.json({error:'Case not found'},404)});
app.post('/api/analyze', async c=>{
  const body:any=await c.req.json().catch(()=>({}));
  const item=body.caseId?demoCases.find(x=>x.id===body.caseId):body.records;
  if(!item) return c.json({error:'Provide a valid caseId or records object'},400);
  const findings:any[]=[]; let score=8;
  const deed=item.deed||{}, khatian=item.khatian||{}, mutation=item.mutation||{};
  if(deed.owner && khatian.owner && deed.owner.trim().toLowerCase()!==khatian.owner.trim().toLowerCase()){score+=45;findings.push({code:'OWNER_MISMATCH',title:'Owner mismatch',severity:'critical',detail:'Deed and khatian owner names differ.',recommendation:'Compare certified records with a qualified land professional.'})}
  if(deed.areaDecimal!=null&&khatian.areaDecimal!=null&&Number(deed.areaDecimal)!==Number(khatian.areaDecimal)){score+=25;findings.push({code:'AREA_MISMATCH',title:'Area mismatch',severity:'high',detail:'Declared areas differ between records.',recommendation:'Verify units and certified survey records.'})}
  if(deed.date && Number.isNaN(Date.parse(deed.date))){score+=20;findings.push({code:'INVALID_DATE',title:'Invalid deed date',severity:'high',detail:'Date cannot be parsed as a valid date.',recommendation:'Check the original certified deed.'})}
  if(deed.dagNo && khatian.dagNo && String(deed.dagNo)!==String(khatian.dagNo)){score+=35;findings.push({code:'DAG_MISMATCH',title:'Dag number mismatch',severity:'critical',detail:'Plot identifiers differ.',recommendation:'Verify mouza, survey type and dag number.'})}
  if(mutation.status && /pending|unknown/i.test(mutation.status)){score+=10;findings.push({code:'MUTATION_REVIEW',title:'Mutation needs review',severity:'medium',detail:'Mutation status requires verification.',recommendation:'Check official mutation records.'})}
  score=Math.min(score,100); const level=score>=80?'critical':score>=60?'high':score>=35?'moderate':'low';
  return c.json({caseId:body.caseId||'custom',caseTitle:item.title||'Custom record comparison',score,level,findings,disclaimer:'Decision-support only. This is not legal advice or proof of ownership.'});
});
// Verifies a Firebase ID token using Firebase's account lookup endpoint before signing a Cloudinary upload.
async function verifyFirebaseToken(token:string, apiKey:string):Promise<any|null>{
  if(!token||!apiKey)return null;
  try { const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:token})}); if(!r.ok)return null; const d:any=await r.json(); return d.users?.[0]||null; } catch { return null; }
}
async function hmacSha1Hex(secret:string, message:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message));return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,'0')).join('');}
app.post('/api/cloudinary/signature',async c=>{
  const auth=c.req.header('Authorization')||''; const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  const firebaseUser=await verifyFirebaseToken(token,c.env.FIREBASE_WEB_API_KEY);
  if(!firebaseUser?.localId)return c.json({error:'Sign in with Firebase before uploading.'},401);
  if(!c.env.CLOUDINARY_CLOUD_NAME||!c.env.CLOUDINARY_API_KEY||!c.env.CLOUDINARY_API_SECRET)return c.json({error:'Cloudinary is not configured on the API.'},503);
  const body:any=await c.req.json().catch(()=>({}));
  const requestedFolder=String(body.folder||'jomiguard/profiles');
  const allowedFolder=requestedFolder==='jomiguard/profiles'?`jomiguard/profiles/${firebaseUser.localId}`:null;
  if(!allowedFolder)return c.json({error:'Unsupported upload folder.'},400);
  const timestamp=Math.floor(Date.now()/1000);
  const params=`folder=${allowedFolder}&timestamp=${timestamp}`;
  const signature=await hmacSha1Hex(c.env.CLOUDINARY_API_SECRET,params);
  return c.json({cloudName:c.env.CLOUDINARY_CLOUD_NAME,apiKey:c.env.CLOUDINARY_API_KEY,timestamp,folder:allowedFolder,signature});
});
app.notFound(c=>c.json({error:'Not found'},404));
app.onError((err,c)=>{console.error('API error',err);return c.json({error:'Internal server error'},500)});
export default app;
