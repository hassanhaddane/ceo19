import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleBaseSurface, damp, mix, smoothstep } from '../src/components/signal/signalMath.ts';
const near = (a,b,tolerance=1e-9) => assert.ok(Math.abs(a-b) < tolerance, `${a} != ${b}`);
test('every sphere vertex has the same radius, including seam and poles', () => {
 for(let y=0;y<=32;y++) for(let x=0;x<=40;x++) {
  const point=sampleBaseSurface(x/40,y/32,1);
  near(Math.hypot(...point),1.35);
 }
});
test('sphere and lens longitude seams close without gaps', () => {
 for(let i=0;i<=32;i++) for(const lens of [0,1]) {
  const a=sampleBaseSurface(0,i/32,1,lens),b=sampleBaseSurface(1,i/32,1,lens);
  a.forEach((value,index)=>near(value,b[index]));
 }
});
test('intermediate vertices are actual plane/sphere interpolations', () => {
 for(const t of [.1,.3,.5,.7,.9]) {
  const a=sampleBaseSurface(.23,.61,0),b=sampleBaseSurface(.23,.61,1),p=sampleBaseSurface(.23,.61,t);
  p.forEach((value,index)=>near(value,mix(a[index],b[index],t)));
 }
});
test('lens keeps an open center and finite normals can be derived from neighbours', () => {
 for(const morph of [0,.25,.5,.75,1]) for(const lens of [0,.5,1]) {
  const a=sampleBaseSurface(.27,.51,morph,lens),u=sampleBaseSurface(.2706,.51,morph,lens),v=sampleBaseSurface(.27,.5106,morph,lens);
  const du=u.map((n,i)=>n-a[i]),dv=v.map((n,i)=>n-a[i]);
  const cross=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];
  assert.ok(cross.every(Number.isFinite)); assert.ok(Math.hypot(...cross)>1e-9);
 }
 near(Math.hypot(...sampleBaseSurface(0,0,1,1).slice(0,2)),.58);
});
test('damping is frame-rate independent and reversible', () => {
 for(const fps of [30,60,120]) {
  let value=0;for(let frame=0;frame<fps;frame++) value=damp(value,1,3.2,1/fps);
  near(value,1-Math.exp(-3.2));
 }
 assert.ok(damp(.8,0,3.2,.016)<.8);
 near(smoothstep(-1),0);near(smoothstep(2),1);near(smoothstep(.5),.5);
});
test('architectural monolith closes at seams and morphs continuously into the same sphere', () => {
 for(let v=0;v<=1;v+=.025) {
  const a=sampleBaseSurface(0,v,0,0,1),b=sampleBaseSurface(1,v,0,0,1);
  a.forEach((value,i)=>near(value,b[i]));
  for(let u=0;u<=1;u+=.025) {
   const slab=sampleBaseSurface(u,v,0,0,1),sphere=sampleBaseSurface(u,v,1,0,1),half=sampleBaseSurface(u,v,.5,0,1);
   assert.ok(slab.every(Number.isFinite));
   half.forEach((value,i)=>near(value,mix(slab[i],sphere[i],.5)));
   near(Math.hypot(...sphere),1.35);
  }
 }
});

test('dual channel keeps a continuous surface, closed seams and finite normals through its morph', () => {
 for(const duality of [0,.25,.5,.75,1]) for(const u of [.125,.249,.25,.251,.375,.749,.75]) {
  const a=sampleBaseSurface(u,.5,.8,.9,0,duality),b=sampleBaseSurface(u+.0006,.5,.8,.9,0,duality),c=sampleBaseSurface(u,.5006,.8,.9,0,duality);
  assert.ok([...a,...b,...c].every(Number.isFinite));
  const du=b.map((x,i)=>x-a[i]),dv=c.map((x,i)=>x-a[i]);
  const normal=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];
  assert.ok(normal.every(Number.isFinite));assert.ok(Math.hypot(...normal)>1e-9);
  assert.ok(Math.hypot(...b.map((x,i)=>x-a[i]))<.1);
  const left=sampleBaseSurface(0,.5,1,.9,0,duality),right=sampleBaseSurface(1,.5,1,.9,0,duality);
  left.forEach((value,i)=>near(value,right[i]));
 }
});
