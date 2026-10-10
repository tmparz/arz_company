(() => {
"use strict";
const source=document.getElementById("walk-l10n");
if(!source)return;
const w=JSON.parse(source.textContent),eng=document.body.dataset.demoLang==="en";
const byId=id=>document.getElementById(id);
const venueBtns=[...document.querySelectorAll("[data-venue]")],dayBtns=[...document.querySelectorAll("[data-day]")];
const mins=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
const fmt=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const date=n=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return new Intl.DateTimeFormat(eng?"en-US":"zh-TW",{month:"short",day:"numeric",weekday:"short"}).format(d);};
const occupied=[{venue:"a",day:1,start:600,status:"approved"},{venue:"b",day:1,start:780,status:"approved"},{venue:"a",day:2,start:840,status:"approved"}];
let venue="a",day=1,start=null,queue=[],counter=1;
const conflict=(v,d,m)=>[...occupied,...queue].find(r=>r.venue===v&&r.day===d&&r.status!=="rejected"&&(m-15<r.start+75&&m+75>r.start-15));
const label=v=>v==="a"?w.venueA:w.venueB;
const note=s=>{byId("walk-message").textContent=s;};
const press=(items,chosen)=>items.forEach(b=>b.setAttribute("aria-pressed",String(b===chosen)));
dayBtns.forEach(b=>{let n=Number(b.dataset.day);b.textContent=date(n)+(n===3?" "+w.closedTag:"");});
function renderTimes(){
  const grid=byId("walk-times");grid.replaceChildren();start=null;byId("walk-submit").disabled=true;
  if(day===3){const p=document.createElement("p");p.className="walk-closed";p.textContent=w.closed;grid.append(p);note(w.closed);return;}
  for(let m=555;m<=1005;m+=15){
    const b=document.createElement("button");b.type="button";b.textContent=fmt(m);b.disabled=!!conflict(venue,day,m);b.setAttribute("aria-pressed","false");
    b.setAttribute("aria-label",fmt(m)+(b.disabled?" · "+w.taken:""));
    b.addEventListener("click",()=>{start=m;grid.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));byId("walk-submit").disabled=false;note(w.ready);});
    grid.append(b);
  }
  note(w.choose);
}
function renderRequests(){
  for(const s of ["pending","approved","rejected"])byId("walk-"+s).textContent=queue.filter(r=>r.status===s).length;
  const out=byId("walk-requests");out.replaceChildren();
  if(!queue.length){const p=document.createElement("p");p.textContent=w.empty;out.append(p);}
  [...queue].reverse().forEach(r=>{
    const card=document.createElement("div");card.className="walk-request";
    const h=document.createElement("strong");h.textContent="#"+r.id+" · "+label(r.venue);
    const p=document.createElement("p");p.textContent=date(r.day)+" · "+fmt(r.start)+"–"+fmt(r.start+60);
    const status=document.createElement("span");status.className="walk-status";status.textContent=w[r.status];
    card.append(h,p,status);
    if(r.status==="pending"){
      const bar=document.createElement("div");bar.className="walk-actions";
      for(const [state,txt,cls] of [["approved",w.accept,"btn--yellow"],["rejected",w.deny,"btn--coral"]]){
        const b=document.createElement("button");b.type="button";b.className="btn "+cls;b.textContent=txt;
        b.addEventListener("click",()=>{r.status=state;renderRequests();renderTimes();note(state==="approved"?w.acceptedText:w.rejectedText);});
        bar.append(b);
      }
      card.append(bar);
    }
    out.append(card);
  });
  byId("walk-seed-list").textContent=occupied.map(r=>label(r.venue)+" · "+date(r.day)+" "+fmt(r.start)+"–"+fmt(r.start+60)).join(" / ");
}
venueBtns.forEach(b=>b.addEventListener("click",()=>{venue=b.dataset.venue;press(venueBtns,b);renderTimes();}));
dayBtns.forEach(b=>b.addEventListener("click",()=>{day=Number(b.dataset.day);press(dayBtns,b);renderTimes();}));
byId("walk-submit").addEventListener("click",()=>{
  if(start===null){note(w.choose);return;}
  if(day===3){renderTimes();note(w.closed);return;}
  if(conflict(venue,day,start)){renderTimes();note(w.taken);return;}
  queue.push({id:counter++,venue,day,start,status:"pending"});
  renderRequests();renderTimes();note(w.sent);
});
byId("walk-reset").addEventListener("click",()=>{queue=[];counter=1;venue="a";day=1;press(venueBtns,venueBtns[0]);press(dayBtns,dayBtns[0]);renderRequests();renderTimes();note(w.resetText);});
renderRequests();renderTimes();
})();