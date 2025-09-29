const state = {
  route: 'home',
  topics: [],
  ledger: JSON.parse(localStorage.getItem('ledger') || '{}')
};

function saveLedger(){ localStorage.setItem('ledger', JSON.stringify(state.ledger)); }
function setRoute(r, params={}){ state.route=r; state.params=params; render(); }

async function loadData(){
  const res = await fetch('./data/topics.json');
  const data = await res.json();
  state.topics = data.topics;
}

function computeMastery(tid){
  const l = state.ledger[tid] || {summary:false, flash:0, mcq:0};
  let m = 0; if(l.summary) m+=30; m+=Math.min(40,(l.flash||0)*10); m+=Math.min(30,(l.mcq||0)*10);
  return Math.min(100,m);
}

function renderHome(){
  return state.topics.map(t=>{
    const mastery = computeMastery(t.id);
    return `<div class='card'>
      <h2>${t.title}</h2>
      <p>System: ${t.system}</p>
      <div class='progress'><div style='width:${mastery}%'></div></div>
      <p>Mastery: ${mastery}%</p>
      <button onclick="setRoute('study',{id:'${t.id}'})">Study</button>
      <button onclick="setRoute('flash',{id:'${t.id}'})">Flashcards</button>
      <button onclick="setRoute('mcq',{id:'${t.id}'})">cMCQ</button>
    </div>`;
  }).join('');
}

function renderStudy(id){
  const t = state.topics.find(x=>x.id===id);
  return `<div class='card'><h2>${t.title}</h2>${t.summary.map(s=>`<p>${s}</p>`).join('')}
    <button onclick="(state.ledger[t.id]={...(state.ledger[t.id]||{}),summary:true},saveLedger(),setRoute('home'))">Mark complete</button>
  </div>`;
}

function renderLedger(){
  return state.topics.map(t=>{
    const l = state.ledger[t.id]||{};
    const m = computeMastery(t.id);
    return `<div class='card'><h3>${t.title}</h3>
      <p>Summary: ${l.summary?'✔':'—'}</p>
      <p>Flash: ${l.flash||0}</p>
      <p>MCQ: ${l.mcq||0}</p>
      <p>Mastery: ${m}%</p></div>`;
  }).join('');
}

function renderSettings(){
  return `<div class='card'><h2>Settings</h2><p>Simple placeholder</p></div>`;
}

function render(){
  let html='';
  if(state.route==='home') html=renderHome();
  if(state.route==='study') html=renderStudy(state.params.id);
  if(state.route==='ledger') html=renderLedger();
  if(state.route==='settings') html=renderSettings();
  document.getElementById('app').innerHTML=html;
}

window.addEventListener('DOMContentLoaded', async ()=>{ await loadData(); render(); });