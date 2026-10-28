// Concept zoning in metres. Footprints exclude the external terrace and site works.
export const residentialPlans={
 18:{width:3,depth:6,rooms:[[0,0,1.5,2,'rKitchen','kitchen'],[1.5,0,1.5,2,'rBathroom','bath'],[0,2,3,4,'rStudio','studio']],doors:[[2.05,2,'h'],[1.8,6,'h']],windows:[[.3,0,.8,'h'],[2,0,.6,'h'],[0,3,1.2,'v'],[3,4,1.2,'v']],openings:[[.25,2,1,'h']]},
 36:{width:6,depth:6,rooms:[[0,0,3,3,'planMaster','bed'],[0,3,3,3,'planSecond','bed'],[3,0,1.5,1.5,'rBathroom','bath'],[4.5,0,1.5,1.5,'rLaundry','utility'],[3,1.5,3,1.5,'rKitchen','kitchen'],[3,3,3,3,'rLiving','living']],doors:[[3,1.9,'v'],[3,4.05,'v'],[3.25,1.5,'h'],[4.85,1.5,'h'],[4.15,6,'h']],windows:[[.6,0,1.2,'h'],[0,4,1.2,'v'],[3.45,0,.6,'h'],[5,0,.6,'h'],[6,1.8,.8,'v'],[6,4,1.2,'v']],openings:[[3.35,3,2.25,'h']]},
 72:{width:6,depth:12,rooms:[[0,0,3,3,'planMaster','bed'],[0,3,3,3,'planSecond','bed'],[0,6,3,3,'rBedroom3','bed'],[3,0,1.5,2,'rBathroom','bath'],[4.5,0,1.5,2,'rLaundry','utility'],[3,2,3,2,'rKitchen','kitchen'],[3,4,3,3,'rDining','dining'],[3,7,3,2,'rFamily','family'],[0,9,6,3,'rLiving','living']],doors:[[3,2.2,'v'],[3,4.2,'v'],[3,7.1,'v'],[3.25,2,'h'],[4.85,2,'h'],[3.85,12,'h']],windows:[[.6,0,1.2,'h'],[0,4,1.2,'v'],[0,7,1.2,'v'],[3.4,0,.6,'h'],[5,0,.6,'h'],[6,2.7,.9,'v'],[6,4.8,1.2,'v'],[6,10,1.2,'v'],[.6,12,1.2,'h']],openings:[[3.3,4,2.4,'h'],[3.3,7,2.4,'h'],[3.3,9,2.4,'h'],[.3,9,2.4,'h']]}
};
export function drawResidentialPlan(size,{t,text}){
 const p=residentialPlans[size],s=size===72?42:60,x=(600-p.width*s)/2,y=80,bottom=y+p.depth*s,height=bottom+s+110;
 const X=m=>x+m*s,Y=m=>y+m*s;
 const rect=(a,b,w,h,attrs)=>`<rect x="${X(a)}" y="${Y(b)}" width="${w*s}" height="${h*s}" ${attrs}/>`;
 let body=p.rooms.map(([a,b,w,h,key,type])=>{
  let furniture='';
  if(type==='bed'||type==='studio')furniture=rect(a+.3,b+.3,1.2,1.9,'rx="3" fill="#fff" stroke="#9aad9f"')+rect(a+.4,b+.4,1,.35,'rx="2" fill="#dce7df" stroke="#9aad9f"');
  if(type==='kitchen')furniture=rect(a+.15,b+.12,w-.3,.5,'fill="#fff" stroke="#9aad9f"')+rect(a+w-.75,b+.18,.4,.35,'rx="3" fill="#dce7df" stroke="#9aad9f"');
  if(type==='bath')furniture=`<ellipse cx="${X(a+.75)}" cy="${Y(b+.48)}" rx="${s*.22}" ry="${s*.3}" fill="#fff" stroke="#9aad9f"/>`+rect(a+.16,b+h-.6,.42,.4,'fill="#fff" stroke="#9aad9f"');
  if(type==='utility')furniture=rect(a+.25,b+.18,.65,.6,'rx="4" fill="#fff" stroke="#9aad9f"')+`<circle cx="${X(a+.575)}" cy="${Y(b+.48)}" r="${s*.2}" fill="none" stroke="#9aad9f"/>`;
  if(type==='dining')furniture=rect(a+.7,b+.5,1.3,.8,'rx="4" fill="#fff" stroke="#9aad9f"')+rect(a+.85,b+.25,1,.2,'fill="#dce7df" stroke="#9aad9f"')+rect(a+.85,b+1.35,1,.2,'fill="#dce7df" stroke="#9aad9f"');
  if(type==='living'||type==='family')furniture=rect(a+.25,b+.25,Math.min(w-.5,1.9),.55,'rx="4" fill="#fff" stroke="#9aad9f"')+rect(a+.65,b+.95,1,.5,'rx="4" fill="#fff" stroke="#9aad9f"');
  const labelY=type==='bed'?b+h-.5:type==='studio'?b+3:type==='kitchen'?b+h-.32:type==='living'?b+h-.8:type==='family'?b+h-.32:b+h-.3;
  return rect(a,b,w,h,`fill="${['bath','utility','kitchen'].includes(type)?'#dfebe4':'#f8f8f1'}" stroke="#193a32" stroke-width="4"`)+furniture+`<text x="${X(a+(type==='bed'?1.2:w/2))}" y="${Y(labelY)}" text-anchor="middle" data-i18n="${key}" class="r-room-label">${t(key)}</text>`;
 }).join('');
 body+=rect(0,0,p.width,p.depth,'fill="none" stroke="#193a32" stroke-width="7"');
 for(const[a,b,l,axis]of p.openings){body+=`<path d="M${X(a)} ${Y(b)}${axis==='h'?`h${l*s}`:`v${l*s}`}" stroke="#f8f8f1" stroke-width="8"/>`;}
 for(const[a,b,axis]of p.doors){const d=.8*s;body+=`<g class="r-door"><path d="M${X(a)} ${Y(b)}${axis==='h'?`h${d}`:`v${d}`}" stroke="#f8f8f1" stroke-width="9"/><path d="M${X(a)} ${Y(b)}${axis==='h'?`v-${d}a${d} ${d} 0 0 1 ${d} ${d}`:`h-${d}a${d} ${d} 0 0 0 ${d} ${d}`}" fill="none" stroke="#718b7b" stroke-width="1.2"/></g>`;}
 for(const[a,b,l,axis]of p.windows)body+=`<g class="r-window"><path d="M${X(a)} ${Y(b)}${axis==='h'?`h${l*s}`:`v${l*s}`}" stroke="#f8f8f1" stroke-width="9"/><path d="M${X(a)} ${Y(b)}${axis==='h'?`h${l*s}`:`v${l*s}`}" stroke="#398780" stroke-width="3"/></g>`;
 const terraceX=size===18?0:3,terraceW=size===18?3:3;
 body+=rect(terraceX,p.depth+.08,terraceW,.9,'fill="#e6ede3" stroke="#9aad9f" stroke-dasharray="4 3"')+`<text x="${X(terraceX+terraceW/2)}" y="${bottom+s*.64}" text-anchor="middle" data-i18n="rTerrace" class="r-room-label">${t('rTerrace')}</text>`;
 body+=`<path d="M${x} 48h${p.width*s}M${x} 42v12M${x+p.width*s} 42v12M${x-28} ${y}v${p.depth*s}M${x-34} ${y}h12M${x-34} ${bottom}h12" stroke="#718b7b"/><text x="300" y="36" text-anchor="middle">${p.width.toFixed(1)} m</text><text x="${x-42}" y="${y+p.depth*s/2}" text-anchor="middle" transform="rotate(-90 ${x-42} ${y+p.depth*s/2})">${p.depth.toFixed(1)} m</text><path d="M${X(terraceX+terraceW/2)} ${bottom+s*1.65}v-${s*.42}m-7 7 7-7 7 7" stroke="#398780" fill="none"/><text x="300" y="${height-12}" text-anchor="middle" class="plan-title">FAD R ${size} / ${size} m²</text>`;
 return `<svg class="floor-plan r-floor-plan" viewBox="0 0 600 ${height}" role="img" aria-labelledby="r-plan-title"><title id="r-plan-title">FAD R ${size} — ${t('rPlanTitle')}</title>${body}</svg><div class="r-plan-legend"><span>${text('rDoorLegend')}</span><span>${text('rWindowLegend')}</span><span>${text('rTerraceNote')}</span></div><p class="fine-print">${text('rPlanNote')}</p>`;
}
