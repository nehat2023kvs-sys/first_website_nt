// ===== PARTICLES =====
const pc=document.getElementById('particles');
for(let i=0;i<18;i++){const p=document.createElement('div');p.className='particle';const s=Math.random()*6+3;p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;background:hsl(${220+Math.random()*60},80%,70%);animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s`;pc.appendChild(p);}

// ===== NAVBAR =====
window.addEventListener('scroll',()=>{document.getElementById('navbar').classList.toggle('scrolled',scrollY>40)});
const ham=document.getElementById('hamburger'),nl=document.getElementById('navLinks');
ham.addEventListener('click',()=>nl.classList.toggle('open'));
nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nl.classList.remove('open')));

// ===== RENDER CHAPTERS =====
const grid=document.getElementById('chaptersGrid');
function renderCards(filter='all'){
  grid.innerHTML='';
  CHAPTERS.filter(c=>filter==='all'||c.cat===filter).forEach(c=>{
    const card=document.createElement('div');
    card.className=`chapter-card card-${c.cat}`;
    card.innerHTML=`
      <div class="card-top">
        <div class="card-icon icon-${c.cat}">${c.icon}</div>
        <span class="card-num">Chapter ${c.id}</span>
      </div>
      <div class="card-title">${c.title}</div>
      <div class="card-desc">${c.desc}</div>
      <div class="card-tags"><span class="tag tag-${c.cat}">${c.cat}</span></div>
      <div class="card-footer">
        <span class="card-meta"><span>${c.concepts.length} concepts</span><span>${c.cbq.length} CBQs</span></span>
        <span class="card-arrow">→</span>
      </div>`;
    card.addEventListener('click',()=>openModal(c));
    grid.appendChild(card);
  });
}
renderCards();

// ===== FILTER =====
document.getElementById('filterTabs').querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');
    renderCards(this.dataset.filter);
  });
});

// ===== MODAL =====
let curChapter=null,curTab='concepts';
const overlay=document.getElementById('modalOverlay');
function openModal(c){
  curChapter=c;curTab='concepts';
  document.getElementById('modalIcon').textContent=c.icon;
  document.getElementById('modalChapterNum').textContent='Chapter '+c.id;
  document.getElementById('modalTitle').textContent=c.title;
  document.getElementById('modalTags').innerHTML=`<span class="tag tag-${c.cat}">${c.cat}</span>`;
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='concepts'));
  renderModalBody('concepts');
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){overlay.classList.remove('open');document.body.style.overflow='';}
document.getElementById('modalClose').addEventListener('click',closeModal);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

document.querySelectorAll('.modal-tab').forEach(tab=>{
  tab.addEventListener('click',function(){
    document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
    this.classList.add('active');
    curTab=this.dataset.tab;
    renderModalBody(curTab);
  });
});

function renderModalBody(tab){
  const body=document.getElementById('modalBody');
  const c=curChapter;
  if(tab==='concepts'){
    body.innerHTML='<h3>🎯 Key Concepts</h3>'+c.concepts.map(k=>`<div class="concept-box"><p>${k}</p></div>`).join('');
  } else if(tab==='activities'){
    body.innerHTML='<h3>🧪 Activities</h3>'+c.activities.map((a,i)=>`<div class="activity-card"><span class="activity-badge">Activity ${i+1}</span><p>${a}</p></div>`).join('');
  } else if(tab==='solutions'){
    body.innerHTML='<h3>📝 Textbook Q&A</h3>'+c.solutions.map((s,i)=>`<div class="solution-card"><div class="question-num">Q${i+1}. ${s.q}</div><p><strong>Answer:</strong> ${s.a}</p></div>`).join('');
  } else if(tab==='questions'){
    body.innerHTML='<h3>💡 Competency Based Questions</h3>'+c.cbq.map((q,i)=>`<div class="cbq-card"><span class="cbq-type">${q.type}</span><p><strong>Q${i+1}:</strong> ${q.q}</p>${q.options.map((o,oi)=>`<p style="font-size:.82rem;color:${oi===q.ans?'var(--green)':'var(--text2)'};padding:.2rem 0;">${String.fromCharCode(65+oi)}) ${o}</p>`).join('')}<div class="key-answer">✓ Answer: ${String.fromCharCode(65+q.ans)}</div><p style="font-size:.8rem;color:var(--text3);margin-top:.5rem">💡 ${q.exp}</p></div>`).join('');
  }
}

// ===== QUIZ =====
const qSel=document.getElementById('quizChapterSelect');
CHAPTERS.forEach(c=>{const o=document.createElement('option');o.value=c.id-1;o.textContent=`Ch ${c.id}: ${c.title.substring(0,40)}...`;qSel.appendChild(o);});
let qIdx=0,score=0,qChapter=null,answered=false;
document.getElementById('startQuizBtn').addEventListener('click',()=>{
  qChapter=CHAPTERS[+qSel.value];qIdx=0;score=0;
  document.getElementById('quizContainer').style.display='block';
  document.getElementById('quizResult').style.display='none';
  showQuestion();
});
function showQuestion(){
  const q=qChapter.cbq[qIdx];answered=false;
  document.getElementById('quizNextBtn').style.display='none';
  document.getElementById('quizChapterLabel').textContent=`Ch ${qChapter.id}: ${qChapter.title.substring(0,30)}...`;
  document.getElementById('quizCounter').textContent=`Q ${qIdx+1} / ${qChapter.cbq.length}`;
  document.getElementById('quizProgressFill').style.width=`${(qIdx/qChapter.cbq.length)*100}%`;
  document.getElementById('quizQText').textContent=q.q;
  const opts=document.getElementById('quizOptions');
  opts.innerHTML=q.options.map((o,i)=>`<button class="quiz-option" data-idx="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span>${o}</button>`).join('');
  opts.querySelectorAll('.quiz-option').forEach(btn=>{
    btn.addEventListener('click',function(){
      if(answered)return;answered=true;
      const chosen=+this.dataset.idx,correct=q.ans;
      if(chosen===correct)score++;
      opts.querySelectorAll('.quiz-option').forEach((b,i)=>{b.classList.add(i===correct?'correct':i===chosen&&chosen!==correct?'wrong':'');b.disabled=true;});
      document.getElementById('quizNextBtn').style.display='inline-flex';
    });
  });
}
document.getElementById('quizNextBtn').addEventListener('click',()=>{
  qIdx++;
  if(qIdx>=qChapter.cbq.length){showResult();}else{showQuestion();}
});
function showResult(){
  document.getElementById('quizContainer').style.display='none';
  const r=document.getElementById('quizResult');r.style.display='block';
  const pct=Math.round(score/qChapter.cbq.length*100);
  document.getElementById('resultEmoji').textContent=pct>=80?'🏆':pct>=50?'👍':'📚';
  document.getElementById('resultTitle').textContent=pct>=80?'Excellent!':pct>=50?'Good Effort!':'Keep Practising!';
  document.getElementById('resultScore').textContent=`${score}/${qChapter.cbq.length}`;
  document.getElementById('resultMsg').textContent=`You scored ${pct}%. ${pct>=80?'Outstanding scientific thinking!':pct>=50?'Review the concepts and try again.':'Go through the chapter and attempt again.'}`;
}
document.getElementById('retryQuizBtn').addEventListener('click',()=>{
  qIdx=0;score=0;
  document.getElementById('quizResult').style.display='none';
  document.getElementById('quizContainer').style.display='block';
  showQuestion();
});

// ===== ACTIVITIES GRID =====
const featActs=[
  {emoji:'🌱',ch:'Ch 2',title:'Fermentation Lab',desc:'Make curd at home and observe how bacteria transform milk.',steps:['Warm 1 cup milk to 40°C','Add 1 tsp curd starter','Cover and keep warm overnight','Observe thick curd formation'],diff:'easy'},
  {emoji:'💡',ch:'Ch 4',title:'Electromagnet',desc:'Build a temporary magnet with wire, battery and a nail.',steps:['Wind 30 turns of wire around an iron nail','Connect wire ends to a battery','Pick up pins with the nail','Disconnect battery — pins drop'],diff:'easy'},
  {emoji:'🌊',ch:'Ch 6',title:'Sea Breeze Model',desc:'Simulate how sea and land breezes form using heat.',steps:['Fill one tray with sand, one with water','Heat both with a lamp','Hold a stick of incense near them','Observe smoke direction'],diff:'medium'},
  {emoji:'🔴',ch:'Ch 7',title:'Ink Diffusion',desc:'Watch particles move by dropping ink in still water.',steps:['Fill a glass with still water','Drop one drop of ink carefully','Do not stir — observe for 5 minutes','Note how ink spreads gradually'],diff:'easy'},
  {emoji:'🌈',ch:'Ch 8',title:'Chromatography',desc:'Separate ink colours using paper chromatography.',steps:['Draw a dot of black marker on filter paper','Dip paper tip in water (not the dot)','Watch capillary action separate colours','Identify component dyes'],diff:'medium'},
  {emoji:'🔭',ch:'Ch 10',title:'Lens Focal Length',desc:'Find the focal length of a convex lens using sunlight.',steps:['Hold convex lens in sunlight','Move a paper behind it','Find where light converges to a bright point','Measure distance — that is focal length'],diff:'medium'}
];
const ag=document.getElementById('activitiesGrid');
featActs.forEach(a=>{
  const card=document.createElement('div');card.className='act-card';
  card.innerHTML=`<div class="act-emoji">${a.emoji}</div><div class="act-chapter">${a.ch}</div><div class="act-title">${a.title}</div><div class="act-desc">${a.desc}</div><div class="act-steps">${a.steps.map(s=>`<div class="act-step">${s}</div>`).join('')}</div><span class="act-difficulty diff-${a.diff}">${a.diff==='easy'?'⭐ Easy':a.diff==='medium'?'⭐⭐ Medium':'⭐⭐⭐ Hard'}</span>`;
  ag.appendChild(card);
});
