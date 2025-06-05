/* === helpers =========================================================== */
const $  = id => document.getElementById(id);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const DOW = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/* === default state ===================================================== */
const base = {
  day: 1,
  money: 300,
  sat: 70,
  phase: 'commute',          // commute → after → done
  log: ['🚀 A brand‑new week at Cubicle Corp™. What could go wrong?'],
  gameOver: false
};

/* === storage =========================================================== */
let state = load();
function load() {
  try { return JSON.parse(localStorage.getItem('corp_state3')) || { ...base }; }
  catch { return { ...base }; }
}
function save() { localStorage.setItem('corp_state3', JSON.stringify(state)); }

/* === DOM refs ========================================================== */
const statDay  = $('stat-day');
const statDow  = $('stat-dow');
const statMon  = $('stat-money');
const statSat  = $('stat-sat');
const logBox   = $('log');
const commuteUI= $('phase-commute');
const afterUI  = $('phase-afterwork');

/* === render ============================================================ */
function addLog(m) { state.log.push(m); }

function checkGameOver() {
  if (state.sat <= 0) {
    state.log.push('😵 Burnout! You start a goat‑yoga farm instead.');
    state.gameOver = true;
    render();
    return true;
  }
  if (state.money <= -500) {
    state.log.push('💸 Bankrupt! Your ergonomic chair is repossessed.');
    state.gameOver = true;
    render();
    return true;
  }
  return false;
}


function render() {
  statDay.textContent = `Day #: ${state.day}`;
  statDow.textContent = `Weekday: ${DOW[(state.day - 1) % 7]}`;
  statMon.textContent = `Money: $${state.money}`;
  statSat.textContent = `Satisfaction: ${state.sat}%`;

  logBox.innerHTML = state.log.slice(-35).map(l => `<p>${l}</p>`).join('');
  logBox.scrollTop = logBox.scrollHeight;

  const dow = (state.day - 1) % 7;
  commuteUI.style.display = (dow <= 4 && state.phase === 'commute' && !state.gameOver) ? 'block' : 'none';
  afterUI.style.display = (dow <= 4 && state.phase === 'after' && !state.gameOver) ? 'block' : 'none';

  // Disable all interactive buttons if game over
  document.querySelectorAll('button.nes-btn').forEach(btn => {
    if (btn.id !== 'btn-reset') btn.disabled = state.gameOver;
  });

  save();
}

/* === commute =========================================================== */
$('btn-commute').onclick = () => {
  const badCommutes = [
    '🚗 You got cut off by a Prius with 6 bumper stickers. -6 Sat, -$8.',
    '🚦 Sat through 3 light cycles for no reason. -6 Sat, -$8.',
    '🚌 Your bus broke down, became a sauna. -6 Sat, -$8.',
    '🚧 Detour turned into a maze. -6 Sat, -$8.',
  ];
  const goodCommutes = [
    '🛴 Electric scooter almost took you out. But vibes were good. +3 Sat.',
    '🎶 Found the perfect song just as you hit the highway. +3 Sat.',
    '☕ Got your coffee order right *and* spelled your name right. +3 Sat.',
    '🌤️ The sun hit just right, made you forget it’s Tuesday. +3 Sat.',
  ];

  if (rnd(0, 1)) {
    state.sat  -= 6;
    state.money-= 8;
    addLog(badCommutes[rnd(0, badCommutes.length - 1)]);
  } else {
    state.sat  += 3;
    addLog(goodCommutes[rnd(0, goodCommutes.length - 1)]);
  }

  // mid‑day: what even happened at work?
  const midDayLogs = [
    '🖥️ Reorganized files you’ll never open again.',
    '📊 Gave feedback on a doc using only emojis.',
    '🤖 Joined a standup where nobody stood up.',
    '🎯 Added “synergy” to a presentation 6 times. Just to be safe.',
    '🧑‍💼 Accidentally became the meeting host. You panicked.',
    '📥 Inbox zero lasted 14 seconds.',
    '🐱 Coworker’s cat joined Zoom. Everyone clapped.',
    '📝 You wrote a killer email... then deleted it all.',
    '📎 The intern asked “what’s a fax machine?” and you felt 47.',
    '🏓 You played ping-pong for “team building.” Lost to your manager.',
  ];
  addLog(midDayLogs[rnd(0, midDayLogs.length - 1)]);

  // optional: vary the soul drain a bit
  state.sat -= rnd(3, 5);

  state.phase = 'after';
  render();
};
/* === after‑work choices =============================================== */
$('btn-impress').onclick = () => {
  state.money += 30;  state.sat -= 7;
  addLog('🤝 You volunteered for “high‑visibility” nonsense. +$30, -7 Sat.');
  endWorkday();
};
$('btn-late').onclick = () => {
  state.money += 45;  state.sat -= 15;
  addLog('💡 Stayed late rearranging JIRA tickets. +$45, -15 Sat.');
  endWorkday();
};
$('btn-traffic').onclick = () => {          // Commute Home
  if (rnd(0,1)) { state.sat -= 12; addLog('🚦 Accident on the freeway. -12 Sat.'); }
  else           { state.sat -= 6;  addLog('🚕 Slow crawl home. -6 Sat.'); }
  endWorkday();
};
$('btn-happy').onclick = () => {
  state.money -= 25; state.sat += 40;
  addLog('🍻 Happy hour “networking.” -$25, +40 Sat.');
  endWorkday();
};

/* === end‑of‑day, daily expenses, random misery ======================== */
function endWorkday() {
  state.money -= 35;          // higher daily burn
  state.sat   -= 3;           // lingering ennui
  randomMisery();             // car/gf/parents events
  nextDay();
}

function randomMisery() {
  const events = [
    () => { state.money -= 20;  addLog('🔧 Car made a weird noise, then a louder one. -$20.'); },
    () => { state.sat -= 20;    addLog('💔 Partner is “doing some thinking.” -20 Sat.'); },
    () => { state.money -= 30; state.sat -= 10; addLog('👪 Parents dropped by “just to see how you’re doing.” -$30, -10 Sat.'); },
    () => { state.money -= 40;  addLog('🏥 Got billed for something you don’t remember doing. -$40.'); },
    () => { state.money -= 30;  addLog('🐾 Dog ate your AirPods. Again. -$90.'); },
    () => { state.sat -= 15;    addLog('📱 Spent 3 hours doomscrolling. -15 Sat.'); },
    () => { state.money -= 120; addLog('📦 Accidentally subscribed to 4 monthly boxes. -$120.'); },
    () => { state.sat -= 12;    addLog('🧼 Roommate hosted a soap-making party in the kitchen. -12 Sat.'); },
    () => { state.money -= 50;  addLog('💻 Laptop charger fried itself. -$50.'); },
    () => { /* nothing */        addLog('🌈 Today was oddly uneventful. No disasters… yet.'); }
  ];
  events[rnd(0, events.length - 1)]();
  // checkGameOver();
}


/* === weekend auto‑roll =============================================== */
function weekendEvent() {
  [
    ()=>{state.sat+=22; state.money-=40; addLog('🌄 Went on a hike and didn’t post about it. +22 Sat, -$40.');},
    ()=>{state.money+=60; state.sat-=12; addLog('🧑‍💻 Took on a side project “just for fun.” +$60, -12 Sat.');},
    ()=>{state.sat+=6; addLog('📺 You and the couch became one. +6 Sat.')},
    ()=>{state.money-=120; addLog('🛒 You bought a rug that “really ties the room together.” -$120.');}
  ][rnd(0,3)]();
}

/* === day progression ================================================== */
function nextDay() {
  state.day++;
  state.phase='commute';
  const dow = (state.day-1)%7;

  // weekend auto‑events
  if (dow===5){ weekendEvent(); state.day++; }   // Saturday
  if (dow===6){ weekendEvent(); state.day++; }   // Sunday

  // check endgame
  if (state.sat<=0){
    addLog('😵 Burnout! You start a goat‑yoga farm instead.');
    disableAll(); return render();
  }
  if (state.money<=-500){
    addLog('💸 Bankrupt! Your ergonomic chair is repossessed.');
    disableAll(); return render();
  }
  
  render();
}
function disableAll(){document.querySelectorAll('button').forEach(b=>b.disabled=true);}

/* === reset button ===================================================== */
$('btn-reset').onclick = () => {
  localStorage.removeItem('corp_state3');
  state = { ...base };
  state.log = ['🚀 A brand‑new week at Cubicle Corp™. What could go wrong?'];

  // FIX: Re-enable all buttons
  document.querySelectorAll('button').forEach(b => b.disabled = false);

  render();
};

/* === boot ============================================================= */
render();
