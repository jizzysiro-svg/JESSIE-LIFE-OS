/* JESSIE NEON ACADEMY — standalone app logic */
(() => {
  'use strict';

  const KEY='jessie-neon-academy-v1';
  const seed = {
    prefs:{theme:'dark',reducedMotion:false,language:'en'},
    goals:[
      {id:'g1',name:'Digital Marketing',category:'Digital marketing',description:'Build practical marketing knowledge from fundamentals to advanced practice.',reason:'Professional growth and The Vibe B.',target:'2027-12-31',priority:'High',phase:'Foundation',archived:false}
    ],
    courses:[
      {id:'c1',goalId:'g1',name:'Marketing Fundamentals',description:'Core marketing concepts and practical foundations.',phase:'Foundation',archived:false}
    ],
    modules:[{id:'m1',courseId:'c1',name:'Module 1',order:1}],
    lessons:[{id:'l1',moduleId:'m1',name:'Lesson 01',order:1,minutes:120,sourceUrl:'',sourceText:'',accessible:true}],
    topics:[{id:'t1',lessonId:'l1',name:'Introduction to Marketing'}],
    notes:[],
    tasks:[
      {id:'task1',title:'Marketing Fundamentals — Lesson 01',goalId:'g1',courseId:'c1',lessonId:'l1',topicId:'t1',date:'2026-10-01',time:'09:00',duration:120,actual:0,priority:'High',status:'planned',notes:'Start Day 01 with the lesson, then capture key knowledge.',materials:'',examId:'',reviewId:''}
    ],
    exams:[], attempts:[], answers:[], reviews:[], sessions:[], events:[],
    seq:1
  };

  let db = load();
  let state = {view:'dashboard', date:new Date('2026-10-01T12:00:00'), calMode:'month', selectedTask:null, editingNote:null, editingGoal:null, editingCourse:null, exam:null};

  function uid(prefix='id'){ return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
  function load(){
    try{const raw=localStorage.getItem(KEY); if(raw){const x=JSON.parse(raw); return {...seed,...x,prefs:{...seed.prefs,...(x.prefs||{})}};}}catch(e){}
    return structuredClone(seed);
  }
  function save(){ localStorage.setItem(KEY,JSON.stringify(db)); }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function fmtDate(s){if(!s)return '—'; const d=new Date(s+'T12:00:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
  function today(){return new Date().toISOString().slice(0,10);}
  function byId(arr,id){return arr.find(x=>x.id===id);}
  function goal(id){return byId(db.goals,id)}
  function course(id){return byId(db.courses,id)}
  function lesson(id){return byId(db.lessons,id)}
  function topic(id){return byId(db.topics,id)}
  function toast(msg,type='ok'){const el=document.getElementById('toast');el.textContent=msg;el.className='toast show '+type;setTimeout(()=>el.className='toast',2400);}
  function setView(v){state.view=v; document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===v)); render(); document.getElementById('sidebar')?.classList.remove('open');}
  function shell(){return document.getElementById('view');}

  function render(){
    const v=state.view;
    if(v==='dashboard') renderDashboard();
    else if(v==='calendar') renderCalendar();
    else if(v==='goals') renderGoals();
    else if(v==='courses') renderCourses();
    else if(v==='vault') renderVault();
    else if(v==='exam') renderExamLab();
    else if(v==='review') renderReview();
    else if(v==='analytics') renderAnalytics();
    else if(v==='library') renderLibrary();
    else renderSettings();
    document.querySelector('.page-title').textContent=({dashboard:'Dashboard',calendar:'Neon Calendar',goals:'My Goals',courses:'My Courses',vault:'Knowledge Vault',exam:'AI Exam Lab',review:'Review Center',analytics:'Progress & Analytics',library:'Study Library',settings:'Settings & Data'}[v]||'Dashboard');
  }

  function stat(label,value,sub,icon='◈'){return '<div class="stat-card"><div class="stat-icon">'+icon+'</div><div><span>'+label+'</span><strong>'+value+'</strong><small>'+sub+'</small></div></div>'}
  function panel(title,body,extra=''){return '<section class="panel"><div class="panel-head"><div><span class="eyebrow">ACADEMY</span><h2>'+title+'</h2></div>'+extra+'</div>'+body+'</section>'}

  function renderDashboard(){
    const d=today(), tasks=db.tasks.filter(x=>x.date===d), notes=db.notes.length, exams=db.attempts.length;
    const studied=tasks.filter(x=>x.status==='completed'||x.status==='studied').length;
    const hours=Math.round(db.sessions.reduce((a,x)=>a+(Number(x.minutes)||0),0)/60*10)/10;
    const weak=db.reviews.filter(r=>r.status==='pending'&&r.date<=d).length;
    const next=tasks.find(x=>x.status!=='completed'&&x.status!=='studied')||tasks[0];
    shell().innerHTML=
      '<div class="command-center">'+
        '<div class="scanline"></div><div class="hud-corner tl"></div><div class="hud-corner tr"></div><div class="hud-corner bl"></div><div class="hud-corner br"></div>'+
        '<div class="hero-copy"><span class="eyebrow">JESSIE // NEON GUIDE ONLINE</span><h1>YOUR LEARNING<br><em>COMMAND CENTER.</em></h1><p>Learn → Understand → Record → Test → Review → Master.</p><div class="live-status"><i></i>SYSTEM READY <span>•</span> DAY '+Math.max(1,Math.floor((new Date(d)-new Date('2026-10-01'))/86400000)+1)+'</div></div>'+
        '<div class="holo-stage"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="orbit orbit-c"></div><div class="scan-ring"></div><div class="holo-grid"></div><div class="holo-particle p1"></div><div class="holo-particle p2"></div><div class="holo-particle p3"></div><div class="jessie-holo"><img src="jessie-academy.svg" alt="Jessie Neon Guide"></div><div class="holo-label">NEON<br><b>GUIDE</b></div></div>'+
      '</div>'+
      '<div class="mission-bar"><div><span class="eyebrow">TODAY'S MISSION</span><strong>'+esc(next?.title||'No mission loaded yet')+'</strong><small>'+(next?(next.duration||0)+' MIN • '+(next.time||'ANY TIME'):'Create your first study mission')+'</small></div><button class="primary mission-btn" data-action="'+(next?'open-task':'add-task')+'" '+(next?'data-id="'+next.id+'"':'')+'>'+(next?'ENTER MISSION →':'CREATE MISSION →')+'</button></div>'+
      '<div class="neon-command-grid">'+
        '<button class="neon-command active-command" data-view="calendar"><span>◫</span><b>PLAN</b><small>Calendar</small></button>'+
        '<button class="neon-command" data-view="vault"><span>◇</span><b>CAPTURE</b><small>Knowledge Vault</small></button>'+
        '<button class="neon-command" data-view="exam"><span>⚡</span><b>TEST</b><small>Exam Lab</small></button>'+
        '<button class="neon-command" data-view="review"><span>↻</span><b>RECALL</b><small>Review Center</small></button>'+
      '</div>'+
      '<div class="neon-stats">'+
        stat('Today',tasks.length,studied+' completed','◉')+
        stat('Study time',hours+'h','recorded','◴')+
        stat('Knowledge',notes,'notes saved','◇')+
        stat('Reviews',weak,exams+' assessments','↻')+
      '</div>'+
      '<div class="grid-2 neon-lower">'+
        panel('Today’s Learning', tasks.length?'<div class="agenda">'+tasks.map(taskRow).join('')+'</div>':'<div class="empty">Your command center is clear. Create your first mission.</div>','<button class="ghost" data-action="add-task">+ Mission</button>')+
        panel('Mastery Signal', masteryOverview())+
      '</div>';
  }

  function taskRow(t){
    const l=lesson(t.lessonId), c=course(t.courseId);
    return '<button class="list-row" data-action="open-task" data-id="'+t.id+'"><span class="row-icon">'+(t.status==='completed'?'✓':'◫')+'</span><span><b>'+esc(t.title)+'</b><small>'+esc(c?.name||'Unlinked')+' · '+(t.time||'Any time')+' · '+(t.duration||0)+' min</small></span><em class="'+t.status+'">'+t.status+'</em></button>';
  }

  function masteryOverview(){
    const total=db.topics.length||1;
    const assessed=new Map();
    db.attempts.forEach(a=>{(a.topicScores||[]).forEach(s=>assessed.set(s.topicId,s.score))});
    const vals=[...assessed.values()];
    const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
    return '<div class="mastery-stack">'+[['Exposure',db.notes.length?80:0],['Recall',avg],['Understanding',Math.min(100,Math.round(avg*.82))],['Application',Math.min(100,Math.round(avg*.58))],['Retention',Math.min(100,Math.round(avg*.48))]].map(x=>'<div class="bar-row"><span>'+x[0]+'</span><div><i style="width:'+x[1]+'%"></i></div><b>'+x[1]+'%</b></div>').join('')+'</div><p class="muted">Assessment evidence is separate from simple completion.</p>';
  }
  function arc(){return '<div class="arc"><div class="arc-node active">LEARN</div><div>→</div><div class="arc-node">RECORD</div><div>→</div><div class="arc-node">TEST</div><div>→</div><div class="arc-node">REVIEW</div><div>→</div><div class="arc-node">MASTER</div></div><p class="muted">Your progress is built from evidence, not from opening a lesson.</p>'}
  function quickCapture(){return '<form id="quick-form"><textarea name="text" placeholder="What did you learn today?"></textarea><div class="form-grid"><select name="goalId">'+goalOptions()+'</select><select name="courseId">'+courseOptions()+'</select></div><button class="primary">Save to Knowledge Vault</button></form>'}

  function goalOptions(selected=''){return '<option value="">Select goal</option>'+db.goals.filter(g=>!g.archived).map(g=>'<option value="'+g.id+'" '+(g.id===selected?'selected':'')+'>'+esc(g.name)+'</option>').join('')}
  function courseOptions(selected=''){return '<option value="">Select course</option>'+db.courses.filter(c=>!c.archived).map(c=>'<option value="'+c.id+'" '+(c.id===selected?'selected':'')+'>'+esc(c.name)+'</option>').join('')}

  function renderCalendar(){
    const d=state.date, y=d.getFullYear(), m=d.getMonth();
    const title=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    let content='';
    if(state.calMode==='month') content=monthGrid(y,m);
    if(state.calMode==='week') content=weekGrid(d);
    if(state.calMode==='day') content=dayGrid(d);
    shell().innerHTML='<div class="calendar-toolbar"><div><span class="eyebrow">LEARNING COMMAND</span><h1>'+title+'</h1></div><div class="toolbar-actions"><button data-action="prev">←</button><button data-action="today">Today</button><button data-action="next">→</button><div class="seg"><button class="'+(state.calMode==='month'?'sel':'')+'" data-cal="month">Month</button><button class="'+(state.calMode==='week'?'sel':'')+'" data-cal="week">Week</button><button class="'+(state.calMode==='day'?'sel':'')+'" data-cal="day">Day</button></div><button class="primary" data-action="add-task">+ New task</button></div></div>'+
      (state.calMode==='month'?'<div class="calendar-layout"><section class="calendar-panel">'+content+'</section><aside class="side-agenda">'+agendaForDate(d)+'</aside></div>':content);
  }
  function monthGrid(y,m){
    const first=new Date(y,m,1), start=new Date(y,m,1-first.getDay()), cells=[];
    for(let i=0;i<42;i++){const x=new Date(start);x.setDate(start.getDate()+i);const iso=x.toISOString().slice(0,10);const ts=db.tasks.filter(t=>t.date===iso);const muted=x.getMonth()!==m; cells.push('<div class="day-cell '+(muted?'muted-day ':'')+(iso===today()?'today-cell ':'')+(iso===state.date.toISOString().slice(0,10)?'selected-cell':'')+'" data-day="'+iso+'"><div class="day-num">'+x.getDate()+'</div><div class="day-dots">'+ts.slice(0,6).map(t=>'<i class="'+(t.status==='completed'?'done':'')+'" title="'+esc(t.title)+'"></i>').join('')+'</div><div class="day-mini">'+ts.slice(0,2).map(t=>'<span>'+esc(t.title).slice(0,20)+'</span>').join('')+'</div></div>')}
    return '<div class="calendar-weekdays">'+['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="calendar-grid">'+cells.join('')+'</div><div class="legend"><span>● Study</span><span>◇ Knowledge</span><span>◎ Exam</span><span>↻ Review</span><span>✓ Complete</span></div>';
  }
  function weekGrid(base){
    const start=new Date(base); start.setDate(base.getDate()-base.getDay()); let cols='';
    for(let i=0;i<7;i++){const x=new Date(start);x.setDate(start.getDate()+i);const iso=x.toISOString().slice(0,10);cols+='<div class="week-col"><header>'+x.toLocaleDateString('en-US',{weekday:'short'})+' <b>'+x.getDate()+'</b></header>'+db.tasks.filter(t=>t.date===iso).map(t=>'<button class="week-task" data-action="open-task" data-id="'+t.id+'">'+esc(t.title)+'<small>'+t.time+' · '+t.duration+'m</small></button>').join('')+'<button class="add-mini" data-action="add-task" data-date="'+iso+'">+</button></div>'}
    return '<div class="week-grid">'+cols+'</div>';
  }
  function dayGrid(d){const iso=d.toISOString().slice(0,10);return '<div class="day-view"><div class="day-head"><span>'+fmtDate(iso)+'</span><b>DAY '+Math.max(1,Math.floor((new Date(iso)-new Date('2026-10-01'))/86400000)+1)+'</b></div>'+agendaForDate(d)+'</div>'}
  function agendaForDate(d){const iso=d.toISOString().slice(0,10), ts=db.tasks.filter(t=>t.date===iso);return '<div class="agenda-card"><div class="panel-head"><div><span class="eyebrow">DAILY AGENDA</span><h2>'+fmtDate(iso)+'</h2></div><button class="ghost" data-action="add-task" data-date="'+iso+'">+ Add</button></div>'+(ts.length?ts.map(taskRow).join(''):'<div class="empty">Nothing scheduled.</div>')+'</div>'}

  function renderGoals(){
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">ROADMAP</span><h1>My Goals</h1><p>Learning goals stay independent from courses, notes and assessments while remaining linked.</p></div><button class="primary" data-action="add-goal">+ New goal</button></div><div class="cards">'+db.goals.map(g=>'<article class="entity-card"><span class="tag">'+esc(g.category)+'</span><h2>'+esc(g.name)+'</h2><p>'+esc(g.description||'')+'</p><div class="meta"><span>Priority: '+esc(g.priority)+'</span><span>Phase: '+esc(g.phase)+'</span><span>Target: '+fmtDate(g.target)+'</span></div><div class="card-actions"><button data-action="edit-goal" data-id="'+g.id+'">Edit</button><button data-action="archive-goal" data-id="'+g.id+'">'+(g.archived?'Restore':'Archive')+'</button></div></article>').join('')+'</div>';
  }
  function renderCourses(){
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">LEARNING STRUCTURE</span><h1>My Courses</h1><p>Goal → Course → Module → Lesson → Topic.</p></div><button class="primary" data-action="add-course">+ New course</button></div><div class="cards">'+db.courses.map(c=>'<article class="entity-card"><span class="tag">'+esc(goal(c.goalId)?.name||'Unlinked')+'</span><h2>'+esc(c.name)+'</h2><p>'+esc(c.description||'')+'</p><div class="meta"><span>'+db.modules.filter(m=>m.courseId===c.id).length+' modules</span><span>'+db.lessons.filter(l=>db.modules.some(m=>m.courseId===c.id&&m.id===l.moduleId)).length+' lessons</span></div><div class="card-actions"><button data-action="edit-course" data-id="'+c.id+'">Edit</button><button data-action="add-lesson" data-id="'+c.id+'">+ Lesson</button></div></article>').join('')+'</div>';
  }

  function renderVault(){
    const q=(document.getElementById('vault-search')?.value||'').toLowerCase();
    const notes=db.notes.filter(n=>!q||[n.title,n.main,n.takeaways,n.explanation,n.tags].join(' ').toLowerCase().includes(q));
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">KNOWLEDGE DATABASE</span><h1>Knowledge Vault</h1><p>Your original writing stays yours. Generated suggestions are kept separate.</p></div><button class="primary" data-action="add-note">+ New note</button></div><div class="vault-tools"><input id="vault-search" value="'+esc(q)+'" placeholder="Search concepts, notes, tags…"><select id="confidence-filter"><option value="">All confidence</option><option>Low</option><option>Medium</option><option>High</option></select></div><div class="notes-grid">'+(notes.length?notes.map(noteCard).join(''):'<div class="empty">No knowledge notes yet. Capture your first concept.</div>')+'</div>';
  }
  function noteCard(n){return '<article class="note-card"><div class="note-top"><span class="tag">'+esc(n.confidence||'Unrated')+'</span><button data-action="edit-note" data-id="'+n.id+'">Edit</button></div><h2>'+esc(n.title)+'</h2><p>'+esc(n.main||n.takeaways||'No summary yet.')+'</p><div class="note-meta">'+esc(goal(n.goalId)?.name||'Unlinked')+' · '+fmtDate(n.date)+'</div><div class="note-actions"><button data-action="note-exam" data-id="'+n.id+'">Test this</button></div></article>'}

  function renderExamLab(){
    const available=db.notes.length;
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">ASSESSMENT ENGINE</span><h1>AI Exam Lab</h1><p>Current build uses your saved knowledge as the source. No fake AI content is presented as course-specific material.</p></div></div><div class="exam-builder">'+
      '<label>Scope<select id="exam-scope"><option value="all">All knowledge notes</option>'+db.goals.map(g=>'<option value="'+g.id+'">Goal: '+esc(g.name)+'</option>').join('')+'</select></label>'+
      '<label>Mode<select id="exam-mode"><option value="quick">Quick Quiz · 5</option><option value="lesson">Lesson Examination · 10</option><option value="recall">Spaced Recall</option><option value="mixed">Mixed Examination</option></select></label>'+
      '<label>Difficulty<select id="exam-diff"><option>Mixed</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>'+
      '<button class="primary" data-action="generate-exam">Generate from '+available+' saved note(s)</button></div>'+
      '<div class="exam-history">'+(db.attempts.length?db.attempts.slice().reverse().slice(0,8).map(a=>'<div class="list-row static"><span class="row-icon">⚡</span><span><b>'+esc(a.title)+'</b><small>'+fmtDate(a.date)+' · '+a.score+'%</small></span><em>'+a.correct+'/'+a.total+'</em></div>').join(''):'<div class="empty">No examination attempts yet.</div>')+'</div>';
  }

  function generateExam(){
    const scope=document.getElementById('exam-scope').value, mode=document.getElementById('exam-mode').value;
    let notes=db.notes.filter(n=>scope==='all'||n.goalId===scope);
    if(!notes.length){toast('Add knowledge notes first. The engine will not invent course-specific questions.','warn');return}
    const count=mode==='quick'?5:mode==='lesson'?10:Math.min(8,Math.max(5,notes.length));
    const qs=[];
    notes.slice().sort(()=>Math.random()-.5).slice(0,count).forEach(n=>{
      const answer=(n.main||n.explanation||n.takeaways||'').trim();
      if(!answer)return;
      const prompt='Explain this concept in your own words, based only on your saved note: “'+n.title+'”.';
      qs.push({id:uid('q'),noteId:n.id,topicId:n.topicId||'',type:'open',prompt,answer,points:10});
    });
    if(!qs.length){toast('Selected notes do not contain enough answerable content.','warn');return}
    state.exam={id:uid('exam'),title:mode==='quick'?'Quick Knowledge Recall':'Knowledge Examination',mode,questions:qs,index:0,responses:{}};
    renderActiveExam();
  }
  function renderActiveExam(){
    const e=state.exam,q=e.questions[e.index];
    shell().innerHTML='<div class="exam-active"><div class="exam-progress"><span>QUESTION '+(e.index+1)+' / '+e.questions.length+'</span><span>'+e.title+'</span></div><article class="question-card"><span class="eyebrow">OPEN RECALL</span><h1>'+esc(q.prompt)+'</h1><textarea id="answer" placeholder="Write your explanation…">'+esc(e.responses[q.id]||'')+'</textarea><div class="question-actions">'+(e.index?' <button class="ghost" data-action="exam-prev">← Previous</button>':'')+(e.index<e.questions.length-1?'<button class="primary" data-action="exam-next">Save & Next →</button>':'<button class="primary" data-action="exam-submit">Submit examination</button>')+'</div></article></div>';
  }
  function submitExam(){
    const e=state.exam; const q=e.questions[e.index]; if(document.getElementById('answer'))e.responses[q.id]=document.getElementById('answer').value.trim();
    let correct=0; const details=e.questions.map(q=>{const r=e.responses[q.id]||''; const terms=(q.answer.toLowerCase().match(/[a-z0-9]{4,}/g)||[]).slice(0,8); const hits=terms.filter(t=>r.toLowerCase().includes(t)).length; const score=terms.length?Math.round(hits/terms.length*100):(r?60:0); if(score>=60)correct++; return {...q,response:r,score};});
    const score=Math.round(details.reduce((a,x)=>a+x.score,0)/details.length);
    const attempt={id:uid('attempt'),title:e.title,date:today(),score,correct,total:details.length,details,topicScores:details.map(x=>({topicId:x.topicId,score:x.score}))};
    db.attempts.push(attempt);
    details.filter(x=>x.score<60).forEach(x=>scheduleReview(x.noteId,x.topicId,'missed concept'));
    save(); state.exam=null; renderResults(attempt);
  }
  function renderResults(a){
    shell().innerHTML='<div class="results"><div class="result-hero"><span class="eyebrow">ASSESSMENT SAVED</span><strong>'+a.score+'%</strong><p>'+a.correct+' / '+a.total+' responses met the recall threshold. This is an assessment signal, not a mastery verdict.</p></div><div class="results-list">'+a.details.map(x=>'<article class="result-row"><div><b>'+esc(x.prompt)+'</b><small>Your answer: '+esc(x.response||'No answer')+'</small></div><span class="'+(x.score>=60?'pass':'fail')+'">'+x.score+'%</span></article>').join('')+'</div><button class="primary" data-action="go-exam">Back to Exam Lab</button></div>';
  }

  function scheduleReview(noteId,topicId,reason){
    const existing=db.reviews.find(r=>r.status==='pending'&&r.noteId===noteId);
    const date=new Date();date.setDate(date.getDate()+1);
    if(existing){existing.date=date.toISOString().slice(0,10);existing.reason=reason;return existing}
    const r={id:uid('review'),noteId,topicId,date:date.toISOString().slice(0,10),reason,status:'pending'};db.reviews.push(r);return r;
  }

  function renderReview(){
    const due=db.reviews.filter(r=>r.status==='pending').sort((a,b)=>a.date.localeCompare(b.date));
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">SPACED RECALL</span><h1>Review Center</h1><p>One clear pending review per knowledge item. Missed concepts are brought back here.</p></div></div><div class="review-list">'+(due.length?due.map(r=>{const n=byId(db.notes,r.noteId);return '<article class="review-card"><span class="tag">'+(r.date<=today()?'DUE NOW':'UPCOMING')+'</span><h2>'+esc(n?.title||'Unknown note')+'</h2><p>'+esc(r.reason)+'</p><div><button class="primary" data-action="review-done" data-id="'+r.id+'">Mark recalled</button><button class="ghost" data-action="open-note" data-id="'+r.noteId+'">Open note</button></div></article>'}).join(''):'<div class="empty">No pending reviews.</div>')+'</div>';
  }
  function renderAnalytics(){
    const totalMinutes=db.sessions.reduce((a,x)=>a+(+x.minutes||0),0), avg=db.attempts.length?Math.round(db.attempts.reduce((a,x)=>a+x.score,0)/db.attempts.length):0;
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">EVIDENCE</span><h1>Progress & Analytics</h1><p>Completion, time, knowledge and assessment are kept as separate signals.</p></div></div><div class="stats">'+stat('Study minutes',totalMinutes,'recorded manually','◴')+stat('Knowledge notes',db.notes.length,'original entries','◇')+stat('Exams',db.attempts.length,'saved attempts','⚡')+stat('Average score',avg+'%','assessment signal','◎')+'</div>'+panel('Assessment History',db.attempts.length?'<div class="chart">'+db.attempts.slice(-10).map(a=>'<div class="chart-bar"><i style="height:'+Math.max(4,a.score)+'%"></i><span>'+a.score+'%</span></div>').join('')+'</div>':'<div class="empty">Complete an assessment to see evidence over time.</div>')+panel('Current Weak Queue','<div class="list">'+db.reviews.filter(r=>r.status==='pending').slice(0,10).map(r=>'<div class="list-row static"><span class="row-icon">↻</span><span><b>'+esc(byId(db.notes,r.noteId)?.title||'Topic')+'</b><small>'+esc(r.reason)+'</small></span><em>'+fmtDate(r.date)+'</em></div>').join('')+'</div>');
  }
  function renderLibrary(){
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">STUDY MATERIALS</span><h1>Study Library</h1><p>Store source links and pasted material with explicit accessibility status.</p></div><button class="primary" data-action="add-resource">+ Add material</button></div><div class="library-grid">'+db.lessons.map(l=>'<article class="entity-card"><span class="tag">'+(l.accessible?'ACCESSIBLE':'ACCESS CHECK NEEDED')+'</span><h2>'+esc(l.name)+'</h2><p>'+esc(l.sourceUrl||'No source URL')+'</p><div class="card-actions"><button data-action="edit-lesson" data-id="'+l.id+'">Edit</button></div></article>').join('')+'</div>';
  }
  function renderSettings(){
    shell().innerHTML='<div class="section-intro"><div><span class="eyebrow">CONTROL</span><h1>Settings & Data</h1><p>Local-first storage for this standalone Academy. Your records remain in this browser unless you export them.</p></div></div><div class="settings-grid"><section class="panel"><h2>Data</h2><p class="muted">Storage key: jessie-neon-academy-v1</p><button class="primary" data-action="export">Export JSON</button><button class="ghost" data-action="import">Import JSON</button><input type="file" id="import-file" accept=".json" hidden></section><section class="panel"><h2>Accessibility</h2><label class="toggle"><input type="checkbox" id="reduced" '+(db.prefs.reducedMotion?'checked':'')+'> Reduced motion</label></section><section class="panel danger"><h2>Reset Academy</h2><p class="muted">This only resets NEON ACADEMY local data. It does not touch JESSIE LIFE OS.</p><button class="danger-btn" data-action="reset">Reset this Academy</button></section></div>';
  }

  function openModal(title,body,saveFn){
    const m=document.getElementById('modal');m.innerHTML='<div class="modal-card"><div class="modal-head"><h2>'+title+'</h2><button data-action="close-modal">×</button></div><form id="modal-form">'+body+'<div class="modal-actions"><button type="button" class="ghost" data-action="close-modal">Cancel</button><button class="primary">Save</button></div></form></div>';m.classList.add('show');
    m.querySelector('#modal-form').onsubmit=e=>{e.preventDefault();saveFn(new FormData(e.currentTarget));m.classList.remove('show');save();render();toast('Saved.');};
  }
  function addGoal(){openModal('New Learning Goal','<label>Name<input name="name" required></label><label>Category<input name="category" value="Digital marketing"></label><label>Description<textarea name="description"></textarea></label><label>Reason<textarea name="reason"></textarea></label><label>Target date<input type="date" name="target"></label><label>Priority<select name="priority"><option>High</option><option>Medium</option><option>Low</option></select></label><label>Phase<input name="phase" value="Foundation"></label>',f=>db.goals.push({id:uid('goal'),name:f.get('name'),category:f.get('category'),description:f.get('description'),reason:f.get('reason'),target:f.get('target'),priority:f.get('priority'),phase:f.get('phase'),archived:false}));}
  function editGoal(id){const g=goal(id);openModal('Edit Goal','<label>Name<input name="name" value="'+esc(g.name)+'" required></label><label>Category<input name="category" value="'+esc(g.category)+'"></label><label>Description<textarea name="description">'+esc(g.description)+'</textarea></label><label>Reason<textarea name="reason">'+esc(g.reason)+'</textarea></label><label>Target date<input type="date" name="target" value="'+esc(g.target)+'"></label><label>Priority<select name="priority"><option '+(g.priority==='High'?'selected':'')+'>High</option><option '+(g.priority==='Medium'?'selected':'')+'>Medium</option><option '+(g.priority==='Low'?'selected':'')+'>Low</option></select></label><label>Phase<input name="phase" value="'+esc(g.phase)+'"></label>',f=>Object.assign(g,{name:f.get('name'),category:f.get('category'),description:f.get('description'),reason:f.get('reason'),target:f.get('target'),priority:f.get('priority'),phase:f.get('phase')}));}
  function addCourse(){openModal('New Course','<label>Goal<select name="goalId">'+goalOptions()+'</select></label><label>Name<input name="name" required></label><label>Description<textarea name="description"></textarea></label>',f=>db.courses.push({id:uid('course'),goalId:f.get('goalId'),name:f.get('name'),description:f.get('description'),phase:'Foundation',archived:false}));}
  function editCourse(id){const c=course(id);openModal('Edit Course','<label>Goal<select name="goalId">'+goalOptions(c.goalId)+'</select></label><label>Name<input name="name" value="'+esc(c.name)+'" required></label><label>Description<textarea name="description">'+esc(c.description)+'</textarea></label>',f=>Object.assign(c,{goalId:f.get('goalId'),name:f.get('name'),description:f.get('description')}));}
  function addLesson(courseId){let c=course(courseId);if(!c){toast('Select a course first.','warn');return}openModal('New Lesson','<label>Course<input value="'+esc(c.name)+'" disabled></label><label>Lesson title<input name="name" required></label><label>Source URL<input name="sourceUrl" placeholder="https://…"></label><label>Pasted accessible content<textarea name="sourceText" placeholder="Paste the material here if the URL cannot be accessed."></textarea></label><label>Duration (minutes)<input type="number" name="minutes" value="90"></label>',f=>{let m=db.modules.find(x=>x.courseId===courseId)||db.modules[db.modules.push({id:uid('module'),courseId,name:'Module 1',order:1})-1];let l={id:uid('lesson'),moduleId:m.id,name:f.get('name'),order:db.lessons.length+1,minutes:+f.get('minutes')||90,sourceUrl:f.get('sourceUrl'),sourceText:f.get('sourceText'),accessible:!!f.get('sourceText')};db.lessons.push(l);});}
  function addNote(pref={}){openModal('Knowledge Note','<label>Title<input name="title" value="'+esc(pref.title||'')+'" required></label><label>Goal<select name="goalId">'+goalOptions(pref.goalId)+'</select></label><label>Course<select name="courseId">'+courseOptions(pref.courseId)+'</select></label><label>Main concept<textarea name="main">'+esc(pref.main||'')+'</textarea></label><label>Key takeaways<textarea name="takeaways"></textarea></label><label>My explanation<textarea name="explanation"></textarea></label><label>Examples / applications<textarea name="examples"></textarea></label><label>Questions / misconceptions<textarea name="questions"></textarea></label><label>Tags<input name="tags"></label><label>Confidence<select name="confidence"><option>Medium</option><option>Low</option><option>High</option></select></label>',f=>db.notes.push({id:uid('note'),title:f.get('title'),goalId:f.get('goalId'),courseId:f.get('courseId'),date:today(),main:f.get('main'),takeaways:f.get('takeaways'),explanation:f.get('explanation'),examples:f.get('examples'),questions:f.get('questions'),tags:f.get('tags'),confidence:f.get('confidence'),revision:[]}));}
  function editNote(id){const n=byId(db.notes,id);openModal('Edit Knowledge Note','<label>Title<input name="title" value="'+esc(n.title)+'" required></label><label>Main concept<textarea name="main">'+esc(n.main)+'</textarea></label><label>Key takeaways<textarea name="takeaways">'+esc(n.takeaways)+'</textarea></label><label>My explanation<textarea name="explanation">'+esc(n.explanation)+'</textarea></label><label>Examples<textarea name="examples">'+esc(n.examples)+'</textarea></label><label>Questions / misconceptions<textarea name="questions">'+esc(n.questions)+'</textarea></label><label>Tags<input name="tags" value="'+esc(n.tags)+'"></label><label>Confidence<select name="confidence"><option '+(n.confidence==='Low'?'selected':'')+'>Low</option><option '+(n.confidence==='Medium'?'selected':'')+'>Medium</option><option '+(n.confidence==='High'?'selected':'')+'>High</option></select></label>',f=>{n.revision=n.revision||[];n.revision.push({date:today(),main:n.main});Object.assign(n,{title:f.get('title'),main:f.get('main'),takeaways:f.get('takeaways'),explanation:f.get('explanation'),examples:f.get('examples'),questions:f.get('questions'),tags:f.get('tags'),confidence:f.get('confidence')})});}
  function addTask(date=today()){openModal('New Study Task','<label>Title<input name="title" required></label><label>Goal<select name="goalId">'+goalOptions()+'</select></label><label>Course<select name="courseId">'+courseOptions()+'</select></label><label>Date<input type="date" name="date" value="'+date+'"></label><label>Time<input type="time" name="time" value="09:00"></label><label>Duration<input type="number" name="duration" value="60"></label><label>Priority<select name="priority"><option>High</option><option>Medium</option><option>Low</option></select></label><label>Notes<textarea name="notes"></textarea></label>',f=>db.tasks.push({id:uid('task'),title:f.get('title'),goalId:f.get('goalId'),courseId:f.get('courseId'),lessonId:'',topicId:'',date:f.get('date'),time:f.get('time'),duration:+f.get('duration')||60,actual:0,priority:f.get('priority'),status:'planned',notes:f.get('notes'),materials:'',examId:'',reviewId:''}));}
  function openTask(id){const t=byId(db.tasks,id);openModal('Study Workspace','<div class="workspace"><div class="workspace-title"><b>'+esc(t.title)+'</b><span>'+fmtDate(t.date)+' · '+(t.time||'')+'</span></div><label>Status<select name="status"><option '+(t.status==='planned'?'selected':'')+'>planned</option><option '+(t.status==='studied'?'selected':'')+'>studied</option><option '+(t.status==='completed'?'selected':'')+'>completed</option></select></label><label>Actual minutes<input type="number" name="actual" value="'+(t.actual||0)+'"></label><label>Notes<textarea name="notes">'+esc(t.notes||'')+'</textarea></label><button type="button" class="ghost" data-action="capture-from-task" data-id="'+id+'">+ Capture knowledge note</button></div>',f=>Object.assign(t,{status:f.get('status'),actual:+f.get('actual')||0,notes:f.get('notes')}));}
  function reviewDone(id){const r=byId(db.reviews,id);if(r){r.status='done';r.completed=today();save();renderReview();toast('Review recorded.')}}

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]'); if(b){const a=b.dataset.action,id=b.dataset.id;
      if(a==='add-task')addTask(b.dataset.date||today());
      else if(a==='open-task')openTask(id);
      else if(a==='add-goal')addGoal(); else if(a==='edit-goal')editGoal(id); else if(a==='archive-goal'){const g=goal(id);g.archived=!g.archived;save();render()}
      else if(a==='add-course')addCourse(); else if(a==='edit-course')editCourse(id); else if(a==='add-lesson')addLesson(id);
      else if(a==='add-note')addNote(); else if(a==='edit-note')editNote(id); else if(a==='note-exam'){const n=byId(db.notes,id);state.exam={id:uid('exam'),title:'Knowledge Recall — '+n.title,mode:'recall',questions:[{id:uid('q'),noteId:n.id,topicId:n.topicId||'',type:'open',prompt:'Explain this concept in your own words: “'+n.title+'”.',answer:n.main||n.explanation||n.takeaways||'',points:10}],index:0,responses:{}};renderActiveExam()}
      else if(a==='generate-exam')generateExam(); else if(a==='exam-next'){state.exam.responses[state.exam.questions[state.exam.index].id]=document.getElementById('answer').value.trim();state.exam.index++;renderActiveExam()}
      else if(a==='exam-prev'){state.exam.index--;renderActiveExam()} else if(a==='exam-submit')submitExam(); else if(a==='go-exam'){setView('exam')}
      else if(a==='review-done')reviewDone(id); else if(a==='open-note'){editNote(id)}
      else if(a==='prev'){if(state.calMode==='month')state.date.setMonth(state.date.getMonth()-1);else state.date.setDate(state.date.getDate()-(state.calMode==='week'?7:1));renderCalendar()}
      else if(a==='next'){if(state.calMode==='month')state.date.setMonth(state.date.getMonth()+1);else state.date.setDate(state.date.getDate()+(state.calMode==='week'?7:1));renderCalendar()}
      else if(a==='today'){state.date=new Date();renderCalendar()}
      else if(a==='close-modal'){document.getElementById('modal').classList.remove('show')}
      else if(a==='reset'){if(confirm('Reset only JESSIE NEON ACADEMY data?')){db=structuredClone(seed);save();render();toast('Academy reset.')}}
      else if(a==='export'){download('jessie-neon-academy-backup.json',JSON.stringify(db,null,2),'application/json')}
      else if(a==='import'){document.getElementById('import-file').click()}
      else if(a==='capture-from-task'){document.getElementById('modal').classList.remove('show');addNote()}
      else if(a==='add-resource'){setView('courses')}
      else if(a==='edit-lesson'){toast('Lesson editor is available from My Courses.','warn')}
    }
    if(e.target.closest('[data-day]')){state.date=new Date(e.target.closest('[data-day]').dataset.day+'T12:00:00');renderCalendar()}
    if(e.target.closest('[data-cal]')){state.calMode=e.target.closest('[data-cal]').dataset.cal;renderCalendar()}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='reduced'){db.prefs.reducedMotion=e.target.checked;save();document.body.classList.toggle('reduced-motion',e.target.checked)}
    if(e.target.id==='import-file'){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render();toast('Import complete.')}catch{toast('Invalid JSON backup.','warn')}};r.readAsText(f)}
    if(e.target.id==='confidence-filter'){renderVault()}
  });
  document.addEventListener('input',e=>{if(e.target.id==='vault-search')renderVault()});
  document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.getElementById('quick-form')?.addEventListener('submit',()=>{});
  function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
  window.addEventListener('DOMContentLoaded',()=>{document.body.classList.toggle('reduced-motion',db.prefs.reducedMotion);render()});
})();