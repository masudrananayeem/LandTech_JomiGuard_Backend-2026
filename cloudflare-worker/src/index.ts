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

// Transaction screening scenarios and rule-based engine (all IDs are fictional).
const transactionScenarios = [
 {id:'clear-baseline',title:'Clear baseline',description:'All supplied synthetic references are consistent.',expectedRisk:'LOW',evidence:{deedId:'SYN-DEED-1001',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-001',transferArea:2,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:false,priorSamePortionSale:false,mutationAvailable:true,mutationOwnerId:'PERSON-001'}},
 {id:'seller-not-owner',title:'Seller is not current owner',description:'Supplied ledger does not identify the seller as an active owner.',expectedRisk:'HIGH',evidence:{deedId:'SYN-DEED-1002',sellerId:'PERSON-003',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-001',transferArea:1,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:false,sellerOwnedArea:0,duplicateDeed:false,priorSamePortionSale:false,mutationAvailable:true,mutationOwnerId:'PERSON-001'}},
 {id:'over-transfer',title:'Transfer exceeds seller share',description:'Requested transfer exceeds the seller area in supplied evidence.',expectedRisk:'HIGH',evidence:{deedId:'SYN-DEED-1003',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-002',transferArea:8,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:false,priorSamePortionSale:false,mutationAvailable:true,mutationOwnerId:'PERSON-001'}},
 {id:'double-sale',title:'Possible double sale',description:'A prior transaction uses the same supplied land-portion identifier.',expectedRisk:'HIGH',evidence:{deedId:'SYN-DEED-1004',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-001',transferArea:1,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:false,priorSamePortionSale:true,mutationAvailable:true,mutationOwnerId:'PERSON-001'}},
 {id:'duplicate-deed',title:'Duplicate deed identifier',description:'Deed ID already appears in supplied synthetic history.',expectedRisk:'HIGH',evidence:{deedId:'SYN-DEED-1001',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-002',transferArea:1,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:true,priorSamePortionSale:false,mutationAvailable:true,mutationOwnerId:'PERSON-001'}},
 {id:'mutation-mismatch',title:'Mutation owner mismatch',description:'Supplied mutation owner differs from the proposed seller.',expectedRisk:'HIGH',evidence:{deedId:'SYN-DEED-1005',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'PORTION-003',transferArea:1,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:false,priorSamePortionSale:false,mutationAvailable:true,mutationOwnerId:'PERSON-003'}},
 {id:'missing-evidence',title:'Incomplete evidence',description:'Some supplied registry or mutation evidence is missing.',expectedRisk:'MEDIUM',evidence:{deedId:'SYN-DEED-1006',sellerId:'PERSON-001',buyerId:'PERSON-002',parcelId:'PARCEL-001',portionId:'',transferArea:1,sellerRegistered:true,buyerRegistered:true,parcelRegistered:true,sellerOwnsParcel:true,sellerOwnedArea:5,duplicateDeed:false,priorSamePortionSale:false,mutationAvailable:false,mutationOwnerId:''}}
];
function screenTransaction(input:any) {
 const checks:any[]=[]; const add=(code:string,title:string,status:'PASS'|'WARNING'|'FAIL',explanation:string,nextStep:string)=>checks.push({code,title,status,explanation,nextStep});
 const val=(v:any)=>String(v??'').trim();
 add('DEED_ID','Deed identifier',val(input.deedId)&&!input.duplicateDeed?'PASS':input.duplicateDeed?'FAIL':'WARNING',input.duplicateDeed?'The deed identifier is already present in supplied history.':val(input.deedId)?'A deed identifier was supplied; official authenticity is not verified.':'No deed identifier was supplied.','Compare the identifier with certified registration records.');
 add('SELLER_REGISTRY','Seller registry reference',input.sellerRegistered?'PASS':'FAIL',input.sellerRegistered?'Seller reference exists in supplied synthetic data.':'Seller reference was not found in supplied synthetic data.','Confirm seller identity through authorized records.');
 add('BUYER_REGISTRY','Buyer registry reference',input.buyerRegistered?'PASS':'FAIL',input.buyerRegistered?'Buyer reference exists in supplied synthetic data.':'Buyer reference was not found in supplied synthetic data.','Confirm buyer identity and ensure seller and buyer are different parties.');
 add('PARCEL_REGISTRY','Parcel reference',input.parcelRegistered?'PASS':'FAIL',input.parcelRegistered?'Parcel reference exists in supplied synthetic data.':'Parcel reference was not found in supplied synthetic data.','Confirm mouza, survey type, khatian and dag against certified records.');
 add('SELLER_OWNERSHIP','Seller ownership',input.sellerOwnsParcel?'PASS':'FAIL',input.sellerOwnsParcel?'Supplied ledger indicates seller ownership.':'Supplied ledger does not show seller as an active owner.','Review the complete ownership chain with an authorized professional.');
 const transfer=Number(input.transferArea),owned=Number(input.sellerOwnedArea); const areaValid=Number.isFinite(transfer)&&transfer>0&&Number.isFinite(owned)&&owned>=0&&transfer<=owned;
 add('TRANSFER_AREA','Transfer area',areaValid?'PASS':'FAIL',!Number.isFinite(transfer)||transfer<=0?'Transfer area must be positive.':transfer>owned?`Requested ${transfer} decimal exceeds supplied seller area ${owned} decimal.`:`Requested transfer (${transfer} decimal) does not exceed supplied seller area (${owned} decimal).`,'Verify units, fractional shares and area from original records.');
 add('DOUBLE_SALE','Same-portion sale history',input.priorSamePortionSale?'FAIL':val(input.portionId)?'PASS':'WARNING',input.priorSamePortionSale?'A prior sale is recorded for the same supplied portion identifier.':val(input.portionId)?'No prior same-portion sale is flagged in supplied synthetic history.':'No reliable portion identifier was supplied.','Compare exact land portion and certified transaction history; area alone does not prove the same physical portion.');
 add('MUTATION_MATCH','Mutation-side owner',!input.mutationAvailable?'WARNING':val(input.mutationOwnerId)===val(input.sellerId)?'PASS':'FAIL',!input.mutationAvailable?'Mutation-side evidence is unavailable.':val(input.mutationOwnerId)===val(input.sellerId)?'Supplied mutation owner matches the deed seller.':'Supplied mutation owner differs from the deed seller.','Verify mutation details through an authorized official channel; a mismatch is a review signal, not proof of fraud.');
 const fails=checks.filter(x=>x.status==='FAIL').length,warnings=checks.filter(x=>x.status==='WARNING').length,passes=checks.filter(x=>x.status==='PASS').length;
 return {screeningId:`JG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${crypto.randomUUID().slice(0,6).toUpperCase()}`,risk:fails?'HIGH':warnings?'MEDIUM':'LOW',score:Math.min(100,fails*22+warnings*8),counts:{pass:passes,warning:warnings,fail:fails,total:checks.length},checks,evidence:{sellerId:val(input.sellerId),buyerId:val(input.buyerId),parcelId:val(input.parcelId),portionId:val(input.portionId)||null,sellerOwnedArea:owned,transferArea:transfer,mutationOwnerId:val(input.mutationOwnerId)||null},disclaimer:'Synthetic-data decision support only. This result does not establish legal title, document authenticity, fraud, or ownership. Confirm certified records with authorized officials and qualified legal professionals.'};
}
app.get('/api/transactions/scenarios', c=>c.json(transactionScenarios));
app.post('/api/transactions/screen', async c=>{
 const body:any=await c.req.json().catch(()=>null); if(!body||typeof body!=='object')return c.json({error:'A JSON request body is required.'},400);
 const scenario=body.scenarioId?transactionScenarios.find(x=>x.id===String(body.scenarioId)):null;
 if(body.scenarioId&&!scenario)return c.json({error:'Unknown synthetic scenario.'},404);
 const evidence=scenario?scenario.evidence:body.evidence;
 if(!evidence||typeof evidence!=='object')return c.json({error:'Provide a valid scenarioId or evidence object.'},400);
 if(String(evidence.sellerId||'') && String(evidence.sellerId)===String(evidence.buyerId||''))return c.json({error:'Seller and buyer must be different synthetic identities.'},400);
 return c.json(screenTransaction(evidence));
});
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
async function cloudinarySha1Hex(secret:string, message:string){const bytes=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(message+secret));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
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
  const signature=await cloudinarySha1Hex(c.env.CLOUDINARY_API_SECRET,params);
  return c.json({cloudName:c.env.CLOUDINARY_CLOUD_NAME,apiKey:c.env.CLOUDINARY_API_KEY,timestamp,folder:allowedFolder,signature});
});
app.notFound(c=>c.json({error:'Not found'},404));
app.onError((err,c)=>{console.error('API error',err);return c.json({error:'Internal server error'},500)});
export default app;
