import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, screenTransaction } from '../src/transactionEngine.js';

test('all synthetic transaction scenarios produce expected risk bands',()=>{
 for(const scenario of scenarios){const result=screenTransaction(scenario.evidence);assert.equal(result.risk,scenario.expectedRisk,scenario.id);assert.equal(result.checks.length,8);assert.equal(result.counts.pass+result.counts.warning+result.counts.fail,8);}
});
test('seller not owner fails ownership check',()=>{
 const s=scenarios.find(x=>x.id==='seller-not-owner')!;const r=screenTransaction(s.evidence);assert.equal(r.checks.find(x=>x.code==='SELLER_OWNERSHIP')?.status,'FAIL');assert.equal(r.risk,'HIGH');
});
test('same portion sale is flagged',()=>{
 const s=scenarios.find(x=>x.id==='double-sale')!;const r=screenTransaction(s.evidence);assert.equal(r.checks.find(x=>x.code==='DOUBLE_SALE')?.status,'FAIL');
});
test('missing portion and mutation evidence are warnings',()=>{
 const s=scenarios.find(x=>x.id==='missing-evidence')!;const r=screenTransaction(s.evidence);assert.equal(r.risk,'MEDIUM');assert.equal(r.checks.find(x=>x.code==='DOUBLE_SALE')?.status,'WARNING');assert.equal(r.checks.find(x=>x.code==='MUTATION_MATCH')?.status,'WARNING');
});
