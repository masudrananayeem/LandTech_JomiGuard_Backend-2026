export type RecordSet = {
  deed?: { owner?: string; areaDecimal?: number; deedNo?: string; date?: string; seller?: string; buyer?: string; mouza?: string; sharePercent?: number; sealDetected?: boolean; sealVerified?: boolean };
  khatian?: { owner?: string; areaDecimal?: number; dagNo?: string; khatianNo?: string; mouza?: string };
  mutation?: { owner?: string; status?: string; date?: string };
  dagNo?: string; khatianNo?: string; mouza?: string;
  priorSales?: Array<{ deedNo?: string; buyer?: string; date?: string; areaDecimal?: number; status?: string }>;
  heirs?: Array<{ name?: string; sharePercent?: number }>;
  plot?: { expectedLatitude?: number; expectedLongitude?: number; submittedLatitude?: number; submittedLongitude?: number; boundaryVerified?: boolean };
};
export type Finding = { code: string; title: string; severity: 'critical'|'high'|'medium'|'low'; detail: string; recommendation: string; points: number };
const norm = (s?: string) => (s || '').normalize('NFKC').replace(/[\s\u200c\u200d]+/g, ' ').trim().toLocaleLowerCase('en');
const close = (a?: number,b?: number) => typeof a === 'number' && typeof b === 'number' && Math.abs(a-b) <= 0.001;
export function analyzeRecords(r: RecordSet) {
  const findings: Finding[] = [];
  const add = (code:string,title:string,severity:Finding['severity'],detail:string,recommendation:string,points:number) => findings.push({code,title,severity,detail,recommendation,points});
  const ownerFields = [r.deed?.owner,r.khatian?.owner,r.mutation?.owner].filter(Boolean) as string[];
  if (ownerFields.length < 3) add('MISSING_OWNER','Owner field incomplete','high','One or more deed, khatian or mutation owner fields are missing.','Review the original records and manually confirm missing fields.',10);
  else if (new Set(ownerFields.map(norm)).size > 1) add('OWNER_MISMATCH','Owner names conflict','critical',`Deed: ${r.deed?.owner}; Khatian: ${r.khatian?.owner}; Mutation: ${r.mutation?.owner}.`,'Have the ownership chain reviewed against certified records by an authorized professional.',25);
  if (!r.deed?.deedNo) add('MISSING_DEED_NUMBER','Deed number missing','medium','No deed number was supplied for cross-checking.','Read the number from the original deed and verify it with the appropriate registry office.',6);
  if (r.deed?.date && !isValidDate(r.deed.date)) add('INVALID_DATE','Invalid deed date','high',`The date “${r.deed.date}” is not a valid calendar date in YYYY-MM-DD format.`,'Check the original document; OCR or manual entry may have misread the date.',10);
  if (r.dagNo && r.khatian?.dagNo && norm(r.dagNo)!==norm(r.khatian.dagNo)) add('DAG_MISMATCH','Dag number mismatch', 'critical',`Submitted dag ${r.dagNo} differs from khatian dag ${r.khatian.dagNo}.`,'Verify the dag and plot identity using official records and a qualified surveyor.',20);
  if (r.khatianNo && r.khatian?.khatianNo && norm(r.khatianNo)!==norm(r.khatian.khatianNo)) add('KHATIAN_MISMATCH','Khatian number mismatch','high',`Submitted khatian ${r.khatianNo} differs from record ${r.khatian.khatianNo}.`,'Confirm the correct khatian and mouza before proceeding.',10);
  if (r.mouza && r.khatian?.mouza && norm(r.mouza)!==norm(r.khatian.mouza)) add('MOUZA_MISMATCH','Mouza information mismatch','high',`Submitted mouza ${r.mouza} differs from khatian mouza ${r.khatian.mouza}.`,'Confirm jurisdiction and record identifiers against official sources.',12);
  if (typeof r.deed?.areaDecimal==='number' && typeof r.khatian?.areaDecimal==='number' && !close(r.deed.areaDecimal,r.khatian.areaDecimal)) add('AREA_MISMATCH','Land area mismatch','high',`Deed reports ${r.deed.areaDecimal} decimal; khatian reports ${r.khatian.areaDecimal} decimal (difference ${Math.abs(r.deed.areaDecimal-r.khatian.areaDecimal).toFixed(2)}).`,'Reconcile the area using original records, map and a qualified surveyor.',20);
  if (r.mutation?.status && /pending|not verified|unknown|rejected/i.test(r.mutation.status)) add('MUTATION_UNVERIFIED','Mutation status needs verification','medium',`Provided mutation status: ${r.mutation.status}.`,'Check status through an authorized official channel; this demo does not connect to government systems.',15);
  if (r.deed?.sealDetected === false) add('SEAL_NOT_DETECTED','Seal not detected by supplied review','medium','The supplied review indicates no seal was detected. This is not proof of invalidity.','Inspect the original document and ask the registry office or legal professional to assess it. Image detection alone cannot establish validity.',8);
  if (r.deed?.sealDetected === true && r.deed?.sealVerified !== true) add('SEAL_UNVERIFIED','Seal requires human verification','low','A seal-like mark was detected but not authenticated.','Verify the seal through authorized human review; visual detection is not authentication.',4);
  const prior = r.priorSales || [];
  const deedNo = norm(r.deed?.deedNo);
  if (prior.some(p => (deedNo && norm(p.deedNo)===deedNo) || (typeof p.areaDecimal==='number' && typeof r.deed?.areaDecimal==='number' && p.areaDecimal >= r.deed.areaDecimal && (!r.deed?.date || !p.date || p.date <= r.deed.date)))) {
    add('POSSIBLE_DUPLICATE_SALE','Possible duplicate or overlapping sale','critical','Prior-sale entries overlap by deed number or reported area/date. The supplied history may be incomplete or inaccurate.','Compare certified deed books, registration details and the full ownership chain. This is a screening alert, not a fraud finding.',25);
  }
  if (r.heirs?.length) {
    const shares = r.heirs.map(h=>h.sharePercent).filter((v):v is number=>typeof v==='number');
    if (shares.length !== r.heirs.length) add('INCOMPLETE_HEIR_SHARES','Inheritance shares incomplete','medium','One or more listed heirs do not have a numeric share.','Have all legal heirs and applicable personal-law shares reviewed by a qualified professional.',10);
    else if (Math.abs(shares.reduce((a,b)=>a+b,0)-100)>0.01 || shares.some(s=>s<0 || s>100)) add('INVALID_HEIR_SHARES','Inheritance shares do not total 100%','high',`Entered heir shares total ${shares.reduce((a,b)=>a+b,0).toFixed(2)}%.`,'Verify the complete heir list and legally applicable share calculation before partition or sale.',15);
  }
  if (r.plot?.boundaryVerified === false) add('BOUNDARY_UNVERIFIED','Plot boundary not verified','medium','The submitted plot boundary has not been verified against a trusted survey/map.','Arrange field survey and compare with authorized cadastral/mouza records.',10);
  if (r.plot && [r.plot.expectedLatitude,r.plot.expectedLongitude,r.plot.submittedLatitude,r.plot.submittedLongitude].every(v=>typeof v==='number')) {
    const distance = haversineKm(r.plot.expectedLatitude!,r.plot.expectedLongitude!,r.plot.submittedLatitude!,r.plot.submittedLongitude!);
    if (distance > 0.1) add('LOCATION_MISMATCH','Submitted location differs','high',`Submitted coordinates are approximately ${distance.toFixed(2)} km from the expected point.`,'Confirm coordinates, datum and plot identity with an authorized map/survey source.',12);
  }
  const score = Math.min(100,findings.reduce((s,f)=>s+f.points,0));
  const level = score<=20?'low':score<=45?'moderate':score<=70?'high':'critical';
  return {score,level,findings,checks:{ownerMatch:!findings.some(f=>f.code==='OWNER_MISMATCH'),dagMatch:!findings.some(f=>f.code==='DAG_MISMATCH'),areaMatch:!findings.some(f=>f.code==='AREA_MISMATCH'),dateValid:!findings.some(f=>f.code==='INVALID_DATE'),mutationVerified:!findings.some(f=>f.code==='MUTATION_UNVERIFIED'),inheritanceSharesValid:!findings.some(f=>f.code==='INVALID_HEIR_SHARES'||f.code==='INCOMPLETE_HEIR_SHARES'),boundaryVerified:!findings.some(f=>f.code==='BOUNDARY_UNVERIFIED')},disclaimer:'This screening only flags inconsistencies in supplied/sample data. It does not establish legal validity, fraud, or ownership. OCR and seal detection are not legal verification. Verify certified records with authorized officials and a qualified legal professional.'};
}
function isValidDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;}
function haversineKm(lat1:number,lon1:number,lat2:number,lon2:number){const rad=(x:number)=>x*Math.PI/180;const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
