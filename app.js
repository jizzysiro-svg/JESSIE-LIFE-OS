const STORE="JESSIE_LIFE_OS_OCT1_NEON_V1";
const START="2026-10-01";
const TEST_MODE=false;
const TEST_KEY="JESSIE_LIFE_OS_V3_TEST_DATE";
const ref="jessie-reference.jpg";

const CURRICULUM=[
["Marketing Fundamentals",["Marketing vs Sales vs Branding","Market","Customer","Target Audience","Persona","Needs","Wants","Pain Points","Value Proposition","Positioning","USP","Competitors","Market Research","Customer Journey","Funnel","Awareness","Consideration","Conversion","Retention","B2B","B2C","Offer","Pricing Psychology","Customer Experience"]],
["Marketing Strategy",["Marketing Objectives","Market Segmentation","Targeting","Positioning Strategy","Marketing Mix","4Ps","7Ps","Competitive Strategy","Go-to-Market","Channel Strategy","Marketing Plan","Budgeting","Strategic Priorities"]],
["Branding",["Brand Purpose","Brand Mission","Brand Vision","Brand Values","Brand Personality","Brand Voice","Visual Identity","Brand Story","Brand Architecture","Brand Equity","Brand Consistency","Rebranding"]],
["Consumer Behavior",["Decision Making","Psychology of Buying","Emotions","Motivation","Social Proof","Trust","Cognitive Biases","Perceived Value","Customer Research","Behavioral Segmentation","Customer Experience"]],
["Content Marketing",["Content Strategy","Content Pillars","Audience Research","Content Formats","Storytelling","Hooks","Copywriting Basics","Editorial Calendar","SEO Content","Distribution","Repurposing","Content Measurement"]],
["Social Media Marketing",["Platform Strategy","Organic Growth","Community Building","Engagement","Instagram Strategy","TikTok Strategy","LinkedIn Strategy","Social Copy","Social Analytics","Influencer Marketing","Social Campaigns"]],
["Digital Marketing",["Digital Ecosystem","SEO","SEM","Email Marketing","Landing Pages","Conversion Rate Optimization","Funnels","Retargeting","Affiliate Marketing","Digital Strategy"]],
["Advertising",["Advertising Fundamentals","Campaign Objectives","Creative Strategy","Ad Copy","Creative Testing","Audience Targeting","Meta Ads","Google Ads","Budget Allocation","CAC","ROAS","Attribution"]],
["Analytics",["Marketing Metrics","KPIs","North Star Metric","Traffic","Conversion Rate","CAC","LTV","ROAS","Funnel Analytics","Dashboards","Experiments","A/B Testing","Data Interpretation"]],
["CRM & Retention",["CRM Fundamentals","Lead Management","Customer Lifecycle","Email Flows","Segmentation","Retention Strategy","Churn","Loyalty","Lifecycle Campaigns","Personalization","Customer Value"]],
["Growth",["Growth Loops","Growth Mindset","Acquisition","Activation","Retention","Referral","Experimentation","Growth Metrics","Product-Led Growth","Virality","Growth Planning"]],
["Marketing Management",["Marketing Leadership","Team Structure","Agency Management","Campaign Planning","Resource Allocation","Marketing Operations","Stakeholder Management","Reporting","Risk Management","Integrated Campaigns","Strategic Review"]]
].map((s,si)=>({id:"s"+(si+1),name:s[0],topics:s[1].map((name,ti)=>({id:`s${si+1}t${ti+1}`,name,objective:`Understand and apply ${name.toLowerCase()} within ${s[0].toLowerCase()}.`,duration:25,difficulty:ti%4===0?"Core":ti%4===1?"Applied":"Advanced"}))}));

function seed(){return {tasks:[],sessions:[],materials:[],notes:{},settings:{dailyTasks:2,review:"light",voice:true,sound:true,voiceVolume:.8,soundVolume:.25,animation:"cinematic",reminders:true,reducedMotion:false},unlocked:0,milestones:{},lastActivity:null,created:Date.now()}}
let state=load(), timer={running:false,seconds:0,start:null,taskId:null,interval:null}, current="dashboard", audio={ctx:null,master:null,ambient:null};

function load(){try{return {...seed(),...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch{return seed()}}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function iso(d=new Date()){return d.toISOString().slice(0,10)}
function dObj(s){let [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function today(){
  if(TEST_MODE){
    const saved=localStorage.getItem(TEST_KEY);
    if(saved && /^\d{4}-\d\d-\d\d$/.test(saved)) return saved;
    const now=iso(); localStorage.setItem(TEST_KEY,now); return now;
  }
  const q=new URLSearchParams(location.search).get("date");
  if(q && /^\d{4}-\d\d-\d\d$/.test(q)) return q;
  const now=iso();
  return now < START ? START : now;
}
function studyDay(){
  if(TEST_MODE){ const base=localStorage.getItem("JESSIE_LIFE_OS_V3_TEST_BASE")||today(); localStorage.setItem("JESSIE_LIFE_OS_V3_TEST_BASE",base); return Math.floor((dObj(today())-dObj(base))/86400000)+1; }
  const a=dObj(START),b=dObj(today());return Math.floor((b-a)/86400000)+1
}
function active(){return TEST_MODE || studyDay()>=1}
function allTopics(){return CURRICULUM.flatMap((s,si)=>s.topics.map((t,ti)=>({...t,section:s.name,sectionId:s.id,order:si*100+ti})))}
const TOPICS=allTopics();
function taskRecord(topic){return {id:"task-"+topic.id,topicId:topic.id,sectionId:topic.sectionId,title:topic.name,description:topic.objective,estimated:topic.duration,difficulty:topic.difficulty,status:"NOT STARTED",studyDay:null,createdDate:today(),scheduledDate:today(),completionDate:null,completionTimestamp:null,notes:"",materialIds:[],review:false,order:topic.order}}
function ensureRecord(topic){let t=state.tasks.find(x=>x.id==="task-"+topic.id);if(!t){t=taskRecord(topic);state.tasks.push(t)}return t}
function completed(t){return t.status==="COMPLETED"}
function taskById(id){return state.tasks.find(t=>t.id===id)}
function topicById(id){return TOPICS.find(t=>t.id===id)}
function generatedCompletedCount(){return state.tasks.filter(completed).length}
function totalTasks(){return TOPICS.length}
function overallPct(){return Math.round(generatedCompletedCount()/totalTasks()*100)}
function topicComplete(id){const t=topicById(id);return !!t&&state.tasks.find(x=>x.topicId===id&&completed(x))}
function sectionPct(s){let ts=s.topics.length,done=s.topics.filter(t=>topicComplete(t.id)).length;return Math.round(done/ts*100)}
function currentTopic(){return TOPICS.find(t=>!topicComplete(t.id))||TOPICS[TOPICS.length-1]}
function nextTask(){return TOPICS.find(t=>!topicComplete(t.id))}
function overdue(){return state.tasks.filter(t=>!completed(t)&&t.scheduledDate<today()).sort((a,b)=>a.order-b.order)}
function ensureDaily(){
 if(!active())return;
 const od=overdue();
 od.forEach(t=>t.scheduledDate=today());
 const existing=new Set(state.tasks.filter(t=>!completed(t)&&t.scheduledDate===today()).map(t=>t.id));
 let slots=Math.max(1,Number(state.settings.dailyTasks)||2);
 for(const t of TOPICS){
   if(existing.size>=slots)break;
   const r=ensureRecord(t);
   if(!completed(r)&&r.scheduledDate<=today()){r.scheduledDate=today();r.studyDay=studyDay();existing.add(r.id)}
 }
 // Preserve any overdue work even if pace is exceeded.
 save();
}
function todayTasks(){ensureDaily();return state.tasks.filter(t=>t.scheduledDate===today()&&!completed(t)).sort((a,b)=>a.order-b.order).slice(0,99)}
function todayDone(){return state.tasks.filter(t=>t.completionDate===today()&&completed(t))}
function currentStreak(){
 let s=0,d=dObj(today());const qualifying=new Set(state.sessions.filter(x=>x.duration>=1).map(x=>x.date));
 while(qualifying.has(iso(d))){s++;d.setDate(d.getDate()-1)}
 return s;
}
function longestStreak(){
 const dates=[...new Set(state.sessions.filter(x=>x.duration>=1).map(x=>x.date))].sort();let best=0,run=0,prev=null;
 dates.forEach(x=>{if(prev&&Math.round((dObj(x)-dObj(prev))/86400000)===1)run++;else run=1;best=Math.max(best,run);prev=x});return best;
}
function studyMinutes(rangeStart=null){return state.sessions.filter(s=>!rangeStart||s.date>=rangeStart).reduce((a,b)=>a+b.duration,0)}
function stage(){const p=overallPct();return p>=100?10:p>=85?9:p>=70?8:p>=55?7:p>=40?6:p>=25?4:p>=10?2:0}
function stageName(){return ["DORMANT","PRESENCE","FACE ONLINE","FORMING","TORSO ONLINE","STRUCTURE","BODY ONLINE","DETAILS","DIMENSION","AWAKENED","COMPLETE"][stage()]}
function milestoneList(){const p=overallPct(),days=currentStreak(),topicCount=generatedCompletedCount();return [
["first-session","First Study Session",state.sessions.length>0],
["first-task","First Completed Task",topicCount>=1],
["first-topic","First Completed Topic",topicCount>=1],
["first-section","First Completed Section",CURRICULUM.some(s=>sectionPct(s)>=100)],
["streak3","3-Day Streak",days>=3],
["streak7","7-Day Streak",days>=7],
["topics10","10 Completed Topics",topicCount>=10],
["p25","25% Curriculum",p>=25],["p50","50% Curriculum",p>=50],["p75","75% Curriculum",p>=75],["p100","100% Curriculum",p>=100]]}
function checkMilestones(){
 let newly=[];for(const [id,name,ok] of milestoneList()){if(ok&&!state.milestones[id]){state.milestones[id]=Date.now();newly.push(name)}}if(newly.length){save();return newly}return[]
}

function fmt(sec){return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`}
function datePretty(s=today()){return dObj(s).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function materialFor(taskId){return state.materials.filter(m=>m.taskId===taskId||m.topicId===taskById(taskId)?.topicId)}
function taskHTML(t,interactive=true){
 const topic=topicById(t.topicId);const overdueFlag=!completed(t)&&t.scheduledDate<today();return `<div class="task ${completed(t)?"done":""}" data-task="${t.id}">
 <button class="check" ${interactive?"onclick":"disabled"}="${interactive?`completeTask('${t.id}')`:""}">${completed(t)?"✓":""}</button>
 <div><div class="task-title">${esc(t.title)}</div><div class="task-meta">${esc(topic?.section||"")} · ${t.estimated} min · ${esc(t.difficulty)}</div></div>
 <div class="task-right"><span class="pill ${overdueFlag?"overdue":""}">${overdueFlag?"OVERDUE":t.status}</span>${interactive&&!completed(t)?`<button class="task-action" onclick="openTask('${t.id}')">OPEN →</button>`:""}</div></div>`
}

function advanceTestDay(){ if(!TEST_MODE)return; const d=dObj(today()); d.setDate(d.getDate()+1); localStorage.setItem(TEST_KEY,iso(d)); ensureDaily(); render(current); toast("TEST DAY ADVANCED · "+datePretty()); }
function resetTestDay(){ if(!TEST_MODE)return; const now=iso(); localStorage.setItem(TEST_KEY,now); localStorage.setItem("JESSIE_LIFE_OS_V3_TEST_BASE",now); state.tasks=[];state.sessions=[];state.notes={};state.materials=[];state.unlocked=0;state.milestones={};state.lastActivity=null;save();ensureDaily();render(current);toast("TEST RESET · STUDY DAY 1"); }
const V={
dashboard(){ensureDaily();const tasks=todayTasks(),done=todayDone(),p=tasks.length?Math.round(done.length/(tasks.length+done.length)*100):0,next=nextTask(),s=stage();return `
<div class="grid g4"><div class="card metric"><div class="label">Study Day</div><div class="value gold">${active()?studyDay():"—"}</div><div class="sub">${active()?datePretty():"Study begins Oct 1, 2026"}</div></div>
<div class="card metric"><div class="label">Today's Completion</div><div class="value">${p}%</div><div class="sub">${done.length} complete · ${tasks.length} remaining</div><div class="progress"><i style="width:${p}%"></i></div></div>
<div class="card metric"><div class="label">Overall Progress</div><div class="value">${overallPct()}%</div><div class="sub">${generatedCompletedCount()} / ${totalTasks()} curriculum topics</div><div class="progress"><i style="width:${overallPct()}%"></i></div></div>
<div class="card metric"><div class="label">Study Streak</div><div class="value gold">${currentStreak()}</div><div class="sub">longest ${longestStreak()} days</div></div></div>
<div class="dashboard-jessie-float" aria-label="JESSIE holographic companion"><div class="jessie-float-aura"></div><div class="jessie-float-ring ring-one"></div><div class="jessie-float-ring ring-two"></div><div class="jessie-float-scan"></div><img src="jessie-reference.jpg" alt="JESSIE holographic companion"><div class="jessie-float-label">JESSIE <span>ONLINE</span></div></div><div class="card hero" style="margin-top:15px"><div class="eyebrow">WHAT DO I DO NOW?</div><h2>${next?esc(next.name):"Marketing Curriculum Complete"}</h2><p>${next?"Your next step is already selected from the curriculum. Open it, study, complete it, and JESSIE will prepare what follows.":"All Marketing curriculum tasks are complete. Your final JESSIE state is unlocked."}</p><button class="primary" onclick="${next?`openTask('task-${next.id}')`:`finale()`}">${next?"START NEXT TASK":"VIEW FINAL EVOLUTION"} →</button></div>
<div class="section-head"><h3>Today's Tasks</h3><span>${done.length}/${done.length+tasks.length} COMPLETE</span></div>
<div class="card now"><div class="now-grid"><div><div class="eyebrow">AUTOMATIC DAILY SYSTEM</div><h3 style="font:600 24px 'Playfair Display';margin:8px 0">${tasks.length?"The system has your next moves ready.":"Today's workload is complete."}</h3><p style="color:var(--muted);font-size:11px;line-height:1.7">Priority: overdue work → next unfinished curriculum topic → additional workload → optional review.</p></div><div class="jessie-mini"><div class="evolution-label"><b>${stageName()}</b><small>JESSIE BUILD · ${overallPct()}%</small></div></div></div><div class="task-list">${done.map(taskHTML).join("")}${tasks.map(taskHTML).join("")}</div></div>
<div class="section-head"><h3>Next</h3><span>AUTOMATICALLY PREPARED</span></div><div class="next-strip"><div class="mini-card"><small>NEXT TOPIC</small><b>${next?esc(next.name):"Complete"}</b><span>${next?esc(next.section):"All sections complete"}</span></div><div class="mini-card"><small>NEXT MILESTONE</small><b>${milestoneList().find(x=>!x[2])?.[1]||"Marketing Curriculum Complete"}</b><span>${overallPct()}% curriculum progress</span></div></div>`},
study(){ensureDaily();const task=todayTasks()[0]||nextTask();if(!task)return `<div class="card hero"><div class="eyebrow">STUDY MODE</div><h2>Curriculum complete.</h2><p>There is no unfinished curriculum task remaining.</p></div>`;const topic=topicById(task.topicId), mats=materialFor(task.id);return `<div class="study-layout"><div class="card study-focus ${timer.running?"complete-flash":""}"><div class="eyebrow">CURRENT TASK · ${esc(topic.section)}</div><h2>${esc(topic.name)}</h2><p class="objective">${esc(topic.objective)}</p><div class="mini-card" style="margin-top:17px"><small>OBJECTIVE</small><b>${esc(topic.objective)}</b><span>${task.estimated} min · ${esc(task.difficulty)} · ${task.status}</span></div><div class="timer" id="timer">${timer.taskId===task.id?fmt(timer.seconds):"00:00"}</div><div class="buttons"><button class="primary" onclick="${timer.running?"pauseSession()":`startSession('${task.id}')`}">${timer.running?"PAUSE FOCUS":"START STUDY"}</button><button class="secondary" onclick="completeTask('${task.id}')">COMPLETE</button><button class="secondary" onclick="skipTask('${task.id}')">SKIP</button></div><textarea class="notes" placeholder="Notes for this topic…" onchange="saveNote('${topic.id}',this.value)">${esc(state.notes[topic.id]||"")}</textarea></div>
<div class="card"><div class="eyebrow">RELEVANT MATERIALS</div>${mats.length?mats.map(m=>`<div class="material-item"><b>${esc(m.title)}</b><p>${esc(m.type)} · ${esc(m.tags||"")}</p>${m.url?`<a href="${esc(m.url)}" target="_blank" rel="noopener">Open reference ↗</a>`:""}</div>`).join(""):`<p style="color:var(--dim);font-size:11px;line-height:1.7;margin-top:15px">No saved materials are linked to this topic yet. Add one in JESSIE Library.</p>`}<button class="secondary" style="margin-top:15px" onclick="openLibraryFor('${topic.id}')">ADD MATERIAL</button><div class="section-head"><h3>Study memory</h3><span>${state.notes[topic.id]?"NOTE SAVED":"NO NOTE YET"}</span></div><p style="color:var(--muted);font-size:10px;line-height:1.7">JESSIE remembers this topic's notes, completion state, sessions and related resources locally.</p></div></div>`},
tasks(){ensureDaily();const todayItems=state.tasks.filter(t=>t.scheduledDate===today()).sort((a,b)=>a.order-b.order);return `<div class="card"><div class="section-head" style="margin-top:0"><h3>Today's Tasks</h3><span>${todayDone().length}/${todayItems.length} COMPLETE</span></div><p style="color:var(--muted);font-size:11px;line-height:1.7">Generated automatically from the curriculum. Unfinished tasks follow you until completed.</p><div class="task-list">${todayItems.map(t=>taskHTML(t)).join("")}</div></div>`},
roadmap(){return `<div class="card"><div class="eyebrow">MARKETING ROADMAP</div><h2 style="font:600 30px 'Playfair Display';margin:8px 0 25px">Twelve sections. One continuous path.</h2>${CURRICULUM.map((s,i)=>{let p=sectionPct(s),cur=s.id===currentTopic()?.sectionId;return `<div class="road ${p>=100?"complete":cur?"current":""}"><i class="road-node"></i><h4>${String(i+1).padStart(2,"0")} — ${esc(s.name)}</h4><p>${p}% · ${s.topics.filter(t=>topicComplete(t.id)).length}/${s.topics.length} topics complete</p></div>`}).join("")}</div><div class="section-head"><h3>Current section topics</h3><span>${esc(currentTopic()?.section||"COMPLETE")}</span></div><div class="card"><div class="topic-grid">${(CURRICULUM.find(s=>s.id===currentTopic()?.sectionId)?.topics||[]).map(t=>`<div class="topic ${topicComplete(t.id)?"done":""}"><b>${esc(t.name)}</b><small>${topicComplete(t.id)?"COMPLETED":"NOT STARTED"}</small><button class="secondary" onclick="openTopic('${t.id}')">VIEW</button></div>`).join("")}</div></div>`},
library(){return `<div class="card"><div class="eyebrow">JESSIE LIBRARY</div><h2 style="font:600 30px 'Playfair Display';margin:8px 0">Your learning materials, connected to the work.</h2><div class="library-tools"><input id="matTitle" class="input" placeholder="Material title"><input id="matUrl" class="input" placeholder="https://…"><select id="matType" class="select"><option>Article</option><option>YouTube</option><option>PDF</option><option>Website</option><option>Course</option><option>Document</option><option>Resource</option></select><select id="matTopic" class="select"><option value="">Auto / unassigned</option>${TOPICS.map(t=>`<option value="${t.id}">${esc(t.section)} · ${esc(t.name)}</option>`).join("")}</select><button class="primary" onclick="addMaterial()">SAVE REFERENCE</button></div><div class="library-grid">${state.materials.length?state.materials.map(m=>`<div class="resource"><span class="tag">${esc(m.type)}</span><h4>${esc(m.title)}</h4><p>${esc(m.notes||"Reference saved — content analysis unavailable unless metadata was explicitly supplied.")}</p><small style="color:var(--dim);font-size:8px">${esc(m.topicId?topicById(m.topicId)?.name:"UNASSIGNED")}</small><div style="margin-top:9px">${m.url?`<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.url)}</a>`:"Local reference"}</div><button class="task-action" onclick="deleteMaterial('${m.id}')">REMOVE</button></div>`).join(""):`<div style="grid-column:1/-1;padding:35px;text-align:center;color:var(--dim)">No materials yet. Save a reference and JESSIE will connect it to the matching topic.</div>`}</div></div>`},
progress(){const p=overallPct(),mins=studyMinutes(),s=stage();const milestones=milestoneList();const days=[...Array(14)].map((_,i)=>{let d=dObj(today());d.setDate(d.getDate()-13+i);let key=iso(d);return {key,n:state.sessions.filter(x=>x.date===key).reduce((a,b)=>a+b.duration,0)}});return `<div class="grid g3"><div class="card character-stage"><div class="jessie" data-stage="${s}"><div class="silhouette"></div><div class="energy"></div><div class="jlayer head"></div><div class="jlayer torso"></div><div class="jlayer lower"></div><div class="jlayer detail"></div></div><div class="evolution-label"><b>${stageName()}</b><small>JESSIE BUILD · ${p}%</small></div></div><div class="card metric"><div class="label">Curriculum</div><div class="value gold">${p}%</div><div class="sub">${generatedCompletedCount()} / ${totalTasks()} topics</div><div class="progress"><i style="width:${p}%"></i></div><div style="margin-top:25px"><div class="label">Current section</div><div class="value" style="font-size:20px">${esc(currentTopic()?.section||"Complete")}</div><div class="sub">${esc(currentTopic()?.name||"")}</div></div></div><div class="card metric"><div class="label">Study Hours</div><div class="value">${(mins/60).toFixed(1)}</div><div class="sub">actual recorded sessions</div><div style="margin-top:25px"><div class="label">Streak</div><div class="value gold">${currentStreak()}</div><div class="sub">longest ${longestStreak()} days</div></div></div></div><div class="section-head"><h3>Study activity</h3><span>LAST 14 DAYS</span></div><div class="card"><div class="chart">${days.map(x=>`<div class="bar" style="height:${Math.max(5,Math.min(100,x.n*4))}%"><small>${dObj(x.key).getDate()}</small></div>`).join("")}</div></div><div class="section-head"><h3>Milestones</h3><span>${milestones.filter(x=>x[2]).length}/${milestones.length}</span></div><div class="card">${milestones.map(m=>`<div class="milestone ${m[2]?"done":""}"><div class="dot">${m[2]?"✓":"·"}</div><div><b>${esc(m[1])}</b><small>${m[2]?"Unlocked":"Not reached yet"}</small></div></div>`).join("")}</div>`},
settings(){return `<div class="card"><div class="eyebrow">SYSTEM SETTINGS</div><h2 style="font:600 30px 'Playfair Display';margin:8px 0 20px">Control the operating system.</h2>
${setting("Daily study tasks","How many meaningful tasks JESSIE prepares each study day.","<input id='dailyRange' class='range' type='range' min='1' max='4' value='"+state.settings.dailyTasks+"' onchange='setDaily(this.value)'><b id='dailyValue'>"+state.settings.dailyTasks+"</b>")}
${toggleSetting("voice","Voice interaction","Short contextual voice messages using browser speech synthesis.")}
${toggleSetting("sound","Sound + soundscape","Optional generated ambient layer and UI tones.")}
${toggleSetting("reminders","Reminder readiness","Keeps reminder settings available without forcing browser notifications.")}
${toggleSetting("reducedMotion","Reduced motion","Preserve functionality while minimizing cinematic movement.")}
<div class="settings-row"><div><b>Animation intensity</b><p>Choose how strongly JESSIE uses cinematic motion.</p></div><select class="select" onchange="state.settings.animation=this.value;save()"><option ${state.settings.animation==="cinematic"?"selected":""}>cinematic</option><option ${state.settings.animation==="subtle"?"selected":""}>subtle</option></select></div>
<div class="settings-row"><div><b>Voice volume</b><p>Browser-native speech volume.</p></div><input class="range" type="range" min="0" max="1" step=".05" value="${state.settings.voiceVolume}" onchange="state.settings.voiceVolume=+this.value;save()"></div>
<div class="settings-row"><div><b>Soundscape volume</b><p>Ambient oscillator volume.</p></div><input class="range" type="range" min="0" max=".5" step=".05" value="${state.settings.soundVolume}" onchange="state.settings.soundVolume=+this.value;save()"></div>
<div class="settings-row"><div><b>Data</b><p>Export or restore the entire local system.</p></div><div class="buttons"><button class="secondary" onclick="exportData()">EXPORT</button><label class="secondary">IMPORT<input type="file" accept="application/json" hidden onchange="importData(this.files[0])"></label></div></div>
<div class="settings-row"><div><b>Recycle system</b><p>Clear task history and restart the learning engine from Study Day 1 — October 1, 2026.</p></div><div class="buttons"><button class="secondary recycle-btn" onclick="resetType('tasks')">♻ RECYCLE TASKS</button><button class="secondary" onclick="resetType('character')">RESET JESSIE</button><button class="secondary" onclick="resetType('all')">RESET ALL</button></div></div>
</div>`},
topic(id){const t=topicById(id);const r=state.tasks.find(x=>x.topicId===id);const mats=state.materials.filter(m=>m.topicId===id);return `<div class="card"><button class="secondary" onclick="navigate('roadmap')">← ROADMAP</button><div class="eyebrow" style="margin-top:20px">${esc(t.section)}</div><h2 style="font:600 32px 'Playfair Display';margin:7px 0">${esc(t.name)}</h2><p style="color:var(--muted);line-height:1.7">${esc(t.objective)}</p><div class="grid g3" style="margin-top:20px"><div class="mini-card"><small>STATUS</small><b>${r&&completed(r)?"COMPLETED":"NOT STARTED"}</b></div><div class="mini-card"><small>DURATION</small><b>${t.duration} MIN</b></div><div class="mini-card"><small>DIFFICULTY</small><b>${t.difficulty}</b></div></div><div class="section-head"><h3>Notes</h3><span>LOCAL MEMORY</span></div><textarea class="notes" onchange="saveNote('${t.id}',this.value)">${esc(state.notes[t.id]||"")}</textarea><div class="section-head"><h3>Related materials</h3><span>${mats.length}</span></div>${mats.map(m=>`<div class="material-item"><b>${esc(m.title)}</b><p>${esc(m.type)} · ${esc(m.notes||"")}</p></div>`).join("")||`<p style="color:var(--dim);font-size:10px">No materials linked yet.</p>`}<div class="buttons" style="margin-top:15px">${r&&!completed(r)?`<button class="primary" onclick="completeTask('${r.id}')">COMPLETE TOPIC</button>`:`<button class="secondary" onclick="createAndOpen('${t.id}')">PREPARE TOPIC TASK</button>`}<button class="secondary" onclick="openLibraryFor('${t.id}')">ADD MATERIAL</button></div></div>`}
};
function setting(title,desc,control){return `<div class="settings-row"><div><b>${title}</b><p>${desc}</p></div><div style="display:flex;gap:9px;align-items:center">${control}</div></div>`}
function toggleSetting(k,title,desc){return setting(title,desc,`<button class="toggle ${state.settings[k]?"on":""}" onclick="state.settings['${k}']=!state.settings['${k}'];save();render('settings')"><i></i></button>`)}

function render(v=current){current=v;ensureDaily();document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===v));document.getElementById("pageTitle").textContent={dashboard:"Command Center",study:"Study Mode",tasks:"Today's Tasks",roadmap:"Roadmap",library:"JESSIE Library",progress:"Progress",settings:"Settings"}[v]||"JESSIE";document.getElementById("dateLabel").textContent=datePretty();document.getElementById("sideStreak").textContent=currentStreak();document.getElementById("view").innerHTML=(TEST_MODE?`<div class="test-banner"><div><b>TEST MODE</b><span>Today is being treated as Study Day ${studyDay()} for testing.</span></div><div class="test-actions"><button class="secondary" onclick="advanceTestDay()">NEXT TEST DAY →</button><button class="secondary" onclick="resetTestDay()">RESET TEST</button></div></div>`:"")+(V[v]?V[v]():V.dashboard())}
function navigate(v){history.replaceState(null,"","#"+v);render(v);document.querySelector(".sidebar").classList.remove("open")}
document.getElementById("nav").onclick=e=>{const b=e.target.closest("button[data-view]");if(b)navigate(b.dataset.view)}
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("quickStart").onclick=()=>{const t=todayTasks()[0]||nextTask();if(t){openTask(t.id)}else{navigate("progress")}};
document.getElementById("voiceBtn").onclick=()=>{state.settings.voice=!state.settings.voice;save();toast(state.settings.voice?"VOICE ON":"VOICE OFF");speak(state.settings.voice?"Voice interaction enabled.":"Voice interaction disabled.")};
document.getElementById("soundBtn").onclick=()=>{state.settings.sound=!state.settings.sound;save();if(state.settings.sound)startAmbient();else stopAmbient();toast(state.settings.sound?"SOUND ON":"SOUND OFF")};

function openTask(id){const t=taskById(id)||ensureRecord(topicById(id.replace("task-","")));if(!t)return;const topic=topicById(t.topicId);const mats=materialFor(t.id);showOverlay(`<button class="overlay-close" onclick="closeOverlay()">×</button><div class="eyebrow">NEXT STEP · ${esc(topic.section)}</div><h2>${esc(topic.name)}</h2><p style="color:var(--muted);line-height:1.7">${esc(topic.objective)}</p><div class="grid g3" style="margin:18px 0"><div class="mini-card"><small>DURATION</small><b>${t.estimated} MIN</b></div><div class="mini-card"><small>DIFFICULTY</small><b>${esc(t.difficulty)}</b></div><div class="mini-card"><small>STATUS</small><b>${esc(t.status)}</b></div></div>${mats.length?`<div class="section-head"><h3>Materials</h3><span>${mats.length}</span></div>${mats.map(m=>`<div class="material-item"><b>${esc(m.title)}</b><p>${esc(m.type)}</p></div>`).join("")}`:""}<div class="buttons" style="margin-top:18px"><button class="primary" onclick="closeOverlay();navigate('study');setTimeout(()=>startSession('${t.id}'),100)">START STUDY</button><button class="secondary" onclick="completeTask('${t.id}');closeOverlay()">COMPLETE</button></div>`)}
function showOverlay(html){document.getElementById("overlayCard").innerHTML=html;document.getElementById("overlay").classList.remove("hidden")}
function closeOverlay(){document.getElementById("overlay").classList.add("hidden")}
document.getElementById("overlay").onclick=e=>{if(e.target.id==="overlay")closeOverlay()}

function startSession(id){if(timer.running)return;timer.taskId=id;timer.start=Date.now();timer.seconds=0;timer.running=true;const t=taskById(id);if(t)t.status="IN PROGRESS";save();speak("Ready? Let's start today's task.");render("study");timer.interval=setInterval(()=>{timer.seconds++;const el=document.getElementById("timer");if(el)el.textContent=fmt(timer.seconds)},1000);if(state.settings.sound)tone("start")}
function pauseSession(){if(!timer.running)return;finishSession(false);render("study")}
function finishSession(saveSession=true){clearInterval(timer.interval);if(timer.running&&saveSession){const minutes=Math.max(1,Math.round(timer.seconds/60));state.sessions.push({id:crypto.randomUUID(),start:new Date(timer.start).toISOString(),end:new Date().toISOString(),duration:minutes,date:today(),taskId:timer.taskId})}timer.running=false;timer.interval=null;timer.seconds=0;timer.start=null;save()}
function completeTask(id){
 const t=taskById(id)||ensureRecord(topicById(id.replace("task-","")));if(!t||completed(t))return;
 const beforePct=overallPct();
 if(timer.running&&timer.taskId===id)finishSession(true);
 else {timer.running=false;timer.taskId=null}
 t.status="COMPLETED";t.completionDate=today();t.completionTimestamp=new Date().toISOString();state.lastActivity=today();
 const newly=checkMilestones();
 const newStage=stage();
 if(newStage>state.unlocked)state.unlocked=newStage;
 save();
 const next=nextTask();
 render(current);
 setTimeout(()=>cinematicReaction(newly,newStage,t,beforePct,overallPct(),next),60);
 if(newly.length)speak(newly.length===1?"New milestone reached.":"Milestones unlocked.");else speak("Done. One step forward.");
 tone("complete");toast("COMPLETED · NEXT STEP PREPARED");
}
function skipTask(id){const t=taskById(id);if(!t)return;t.status="SKIPPED";t.scheduledDate=today();save();render(current);toast("SKIPPED · JESSIE WILL KEEP IT IN MEMORY")}
function saveNote(topicId,val){state.notes[topicId]=val;save();toast("NOTE SAVED")}
function createAndOpen(id){const t=ensureRecord(topicById(id));t.scheduledDate=today();save();openTask(t.id)}
function openTopic(id){history.replaceState(null,"","#topic/"+id);current="topic";document.querySelectorAll("#nav button").forEach(b=>b.classList.remove("active"));document.getElementById("pageTitle").textContent="Topic";document.getElementById("view").innerHTML=V.topic(id)}
function openLibraryFor(topicId){navigate("library");setTimeout(()=>{const s=document.getElementById("matTopic");if(s)s.value=topicId},0)}

function addMaterial(){const title=document.getElementById("matTitle")?.value.trim(),url=document.getElementById("matUrl")?.value.trim(),type=document.getElementById("matType")?.value,topicId=document.getElementById("matTopic")?.value||null;if(!title){toast("Add a material title first");return}state.materials.push({id:crypto.randomUUID(),title,url,type,topicId,taskId:topicId?("task-"+topicId):null,notes:"Reference saved — content analysis unavailable unless metadata was explicitly supplied.",tags:"",dateAdded:today()});save();tone("nav");render("library");toast("REFERENCE SAVED")}
function deleteMaterial(id){state.materials=state.materials.filter(x=>x.id!==id);save();render("library");toast("REFERENCE REMOVED")}

function setDaily(v){state.settings.dailyTasks=+v;save();const e=document.getElementById("dailyValue");if(e)e.textContent=v;ensureDaily()}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="jessie-life-os-backup.json";a.click();URL.revokeObjectURL(a.href)}
function importData(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.tasks||!x.settings)throw Error();state=x;save();render("settings");toast("SYSTEM RESTORED")}catch{toast("Invalid backup file")}};r.readAsText(file)}
function resetType(k){
 if(!confirm("Recycle this JESSIE system state and restart from October 1, 2026?"))return;
 if(k==="all"||k==="tasks"){state.tasks=[];state.sessions=[];state.notes={};state.lastActivity=null;}
 if(k==="all"){state.materials=[];state.unlocked=0;state.milestones={};}
 if(k==="character"){state.unlocked=0;state.milestones={};}
 save();ensureDaily();render("settings");toast(k==="character"?"JESSIE RESET":"SYSTEM RECYCLED · OCTOBER 1 START");
}
function finale(){showOverlay(`<button class="overlay-close" onclick="closeOverlay()">×</button><div class="eyebrow">FINAL EVOLUTION</div><h2>MARKETING CURRICULUM COMPLETE</h2><p style="color:var(--muted);line-height:1.7">Every curriculum topic is complete. JESSIE has reached the final visual state and your completed history remains intact.</p><div class="jessie reveal" data-stage="10" style="margin:25px auto"><div class="silhouette"></div><div class="energy"></div><div class="jlayer head"></div><div class="jlayer torso"></div><div class="jlayer lower"></div><div class="jlayer detail"></div></div><button class="primary" onclick="closeOverlay();render('progress')">CONTINUE →</button>`);speak("Marketing curriculum complete.")}
function cinematicReaction(newly,stageNow,completedTask,beforePct,afterPct,next){
 const el=document.querySelector(".study-focus")||document.querySelector(".now");
 if(el){el.classList.add("complete-flash");setTimeout(()=>el.classList.remove("complete-flash"),1100)}
 const j=document.querySelector(".jessie");
 if(j){j.classList.add("reveal");setTimeout(()=>j.classList.remove("reveal"),1200)}
 if(stageNow>=10){finale();return}
 showHologramCelebration(completedTask,beforePct,afterPct,newly,stageNow,next);
}

function showHologramCelebration(t,beforePct,afterPct,newly,stageNow,next){
 if(state.settings.reducedMotion)return;
 const topic=topicById(t.topicId);
 const nextTopic=next?topicById(next.topicId):null;
 const stageLabel=stageName();
 const milestoneText=newly.length?`<div class="holo-milestone"><span>◈</span><div><small>MILESTONE SIGNAL</small><b>${esc(newly[0])}</b></div></div>`:"";
 showOverlay(`<div class="holo-wrap">
   <div class="holo-grid"></div><div class="holo-scan"></div><div class="holo-orbit orbit-a"></div><div class="holo-orbit orbit-b"></div>
   <div class="holo-topline"><span>JESSIE / COMMAND CHAMBER</span><span>SYNC ${afterPct}%</span></div>
   <div class="holo-character"><div class="holo-ring ring-1"></div><div class="holo-ring ring-2"></div><div class="holo-beam"></div>
     <div class="jessie holo-jessie" data-stage="${stageNow}"><div class="silhouette"></div><div class="energy"></div><div class="jlayer head"></div><div class="jlayer torso"></div><div class="jlayer lower"></div><div class="jlayer detail"></div></div>
     <div class="holo-label">${esc(stageLabel)}<span>EVOLUTION STATE</span></div>
   </div>
   <div class="holo-panel panel-left"><small>MISSION COMPLETE</small><b>+1 TASK</b><span>${esc(topic?.name||t.title)}</span></div>
   <div class="holo-panel panel-right"><small>CURRICULUM SYNC</small><b>${beforePct}% → ${afterPct}%</b><span>${esc(topic?.section||"")}</span></div>
   <div class="holo-bottom"><div><small>NEXT OBJECTIVE</small><b>${esc(nextTopic?.name||"CURRICULUM COMPLETE")}</b></div><button class="primary" onclick="closeOverlay();setTimeout(()=>{if(${next?"true":"false"})openTask('${next?.id||""}')},120)">NEXT STEP →</button></div>
   ${milestoneText}
 </div>`);
 setTimeout(()=>{const w=document.querySelector('.holo-wrap');if(w)w.classList.add('ignite')},30);
}

function speak(text){if(!state.settings.voice||!("speechSynthesis"in window))return;const u=new SpeechSynthesisUtterance(text);u.volume=state.settings.voiceVolume;u.rate=.92;u.pitch=.88;speechSynthesis.cancel();speechSynthesis.speak(u)}
function tone(kind){if(!state.settings.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!audio.ctx)audio.ctx=new C();const c=audio.ctx,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=kind==="complete"?720:kind==="start"?220:420;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime((state.settings.soundVolume||.2)*.25,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.32);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.35)}catch{}}
function startAmbient(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(audio.ctx)audio.ctx.resume();else audio.ctx=new C();const c=audio.ctx,g=c.createGain(),o=c.createOscillator();g.gain.value=(state.settings.soundVolume||.2)*.08;o.type="sine";o.frequency.value=55;o.connect(g).connect(c.destination);o.start();audio.ambient=o;audio.master=g}catch{}}
function stopAmbient(){try{audio.ambient?.stop()}catch{}audio.ambient=null}
function parseRoute(){const h=location.hash.slice(1)||"dashboard";if(h.startsWith("topic/")){openTopic(h.slice(6));return}navigate(V[h]?h:"dashboard")}
window.addEventListener("hashchange",parseRoute);window.addEventListener("beforeunload",()=>{if(timer.running)finishSession(true)});window.addEventListener("keydown",e=>{if(e.key==="Escape")closeOverlay()});
ensureDaily();parseRoute();if(state.settings.sound)startAmbient();
