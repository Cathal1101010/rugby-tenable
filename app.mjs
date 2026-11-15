import {dayLength,utcDay,puzzleFor,storageKey,newGame,finished,submit,suggestions,resolveGuess,statsFor,shareText} from './game.mjs';
const $ = id => document.getElementById(id);
const input = $('guess');
const list = $('suggestions');
const board = $('board');
const feedback = $('feedback');
let day, puzzle, game, matches = [], active = -1;
let replayDay, month, busy = false;
const launchDay = utcDay(Date.UTC(2026,10,13));
const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
const dateFormat = new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const memory = new Map();
let storageAvailable = true;

function load(key) {
  try {
    if (storageAvailable) return JSON.parse(localStorage.getItem(key)) ?? newGame();
  } catch {
    storageAvailable = false;
  }
  return memory.get(key) ?? newGame();
}
function save() {
  if (replayDay !== undefined) return;
  const key = storageKey+day;
  memory.set(key,game);
  try { localStorage.setItem(key,JSON.stringify(game)); }
  catch {
    storageAvailable = false;
    feedback.textContent += ' Progress can only be kept while this tab is open.';
  }
}
function closeSuggestions() {
  matches = [];
  active = -1;
  list.hidden = true;
  list.replaceChildren();
  input.setAttribute('aria-expanded','false');
  input.removeAttribute('aria-activedescendant');
}
function showSuggestions() {
  closeSuggestions();
  if (finished(game)) return;
  matches = suggestions(input.value,puzzle);
  matches.forEach((name,index) => {
    const option = document.createElement('li');
    option.id = 'option-'+index;
    option.setAttribute('role','option');
    option.setAttribute('aria-selected','false');
    option.textContent = name;
    option.addEventListener('pointerdown',event=>event.preventDefault());
    option.addEventListener('click',()=>guess(name));
    list.append(option);
  });
  list.hidden = !matches.length;
  input.setAttribute('aria-expanded',String(matches.length > 0));
}
function render(animatedRank = -1) {
  const score = game.correct.length;
  const lives = 3-game.wrong.length;
  $('score').textContent = score+' / 10';
  $('lives').textContent = '♥'.repeat(lives)+'♡'.repeat(3-lives);
  $('lives').setAttribute('aria-label',lives+' out of 3');
  board.replaceChildren(...puzzle.answers.map(([team,value],index) => {
    const row = document.createElement('li');
    const found = game.correct.includes(team);
    row.className = found ? 'found' : game.revealed ? 'missed' : 'unfilled';
    if (index === animatedRank) row.classList.add('land');
    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = String(index+1).padStart(2,'0');
    const name = document.createElement('span');
    name.className = 'team';
    name.textContent = found || game.revealed ? team : '—';
    const stat = document.createElement('span');
    stat.className = 'value';
    stat.textContent = found || game.revealed ? (puzzle.unit ? value+' '+puzzle.unit : '') : '';
    row.append(rank,name,stat);
    return row;
  }));
  const ended = finished(game);
  $('guess-form').hidden = ended;
  $('result').hidden = !ended;
  $('result-archive').hidden = !ended || !canReplay();
  $('result-title').textContent = score === 10 ? 'Perfect ten!' : 'Full time · '+score+'/10';
  $('reveal').hidden = game.revealed || score === 10;
  $('source').hidden = !game.revealed && score !== 10;
  $('source').href = puzzle.source;
  if (ended) closeSuggestions();
  if ($('stats').open) renderStats();
}
function sync() {
  const currentDay = utcDay();
  if (busy || replayDay !== undefined || currentDay === day) return false;
  day = currentDay;
  showPuzzle(day,load(storageKey+day));
  return true;
}
function showPuzzle(date,state) {
  puzzle = puzzleFor(date);
  game = state;
  $('edition').textContent = (replayDay === undefined ? 'Daily quiz' : 'Archive replay')+'  /  '+dateFormat.format(date*dayLength);
  $('return-daily').hidden = replayDay === undefined;
  $('question').textContent = puzzle.question;
  $('context').textContent = puzzle.context+(puzzle.choices ? '' : ' · Ties, including the cutoff, go alphabetically');
  $('share-copy').hidden = true;
  $('share-status').textContent = '';
  input.value = '';
  feedback.textContent = storageAvailable ? '' : 'Browser storage is unavailable. Progress lasts while this tab is open.';
  closeSuggestions();
  render();
}
async function climb(rank) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let index=board.children.length-1; index>=Math.max(rank,0); index--) {
    const row = board.children[index];
    row.classList.add('ladder-step');
    row.scrollIntoView({block:'nearest'});
    await wait(index === rank ? 340 : 230);
    row.classList.remove('ladder-step');
  }
  if (rank < 0) {
    const top = $('ladder-top');
    top.hidden = false;
    top.scrollIntoView({block:'nearest'});
    await wait(350);
    top.hidden = true;
  }
}
async function showNotice(message,duration,{win = false, guess = false} = {}) {
  const notice = $('game-outcome');
  notice.classList.toggle('win',win);
  notice.classList.toggle('guess-notice',guess);
  notice.textContent = message;
  await wait(duration);
  notice.textContent = '';
}
async function guess(text) {
  if (busy) return;
  input.blur();
  closeSuggestions();
  if (sync()) {
    feedback.textContent = 'A new puzzle is ready.';
    return;
  }
  if (replayDay === undefined) game = load(storageKey+day);
  const outcome = submit(game,puzzle,text);
  if (outcome.kind === 'empty') return;
  if (outcome.kind === 'finished') { render(); return; }
  if (outcome.kind === 'unknown') {
    feedback.textContent = puzzle.choices ? 'Choose a player from the list.' : 'Choose a country or rugby team from the list.';
    return;
  }
  busy = true;
  const controls = [input,$('guess-form').querySelector('button'),$('show-stats'),$('show-help'),$('return-daily')];
  controls.forEach(control=>control.disabled = true);
  try {
    input.value = '';
    if (outcome.kind === 'duplicate') {
      feedback.textContent = 'You already guessed '+outcome.team+'.';
      await showNotice(feedback.textContent,1700,{guess:true});
      return;
    }
    feedback.textContent = 'Checking '+text+'…';
    await climb(outcome.rank ?? -1);
    game = outcome.game;
    feedback.textContent = outcome.kind === 'correct'
      ? outcome.team+' lands at number '+(outcome.rank+1)+'.'
      : text+' is not on the list. '+(3-game.wrong.length)+' lives left.';
    save();
    render(outcome.rank);
    if (outcome.kind === 'wrong') {
      await showNotice(text+' is not on the list',2000,{guess:true});
    }
    if (finished(game)) {
      const won = game.correct.length === 10;
      await showNotice(won ? 'You win!' : 'Hard luck, you lose',1250,{win:won});
      openStats();
    }
  } finally {
    busy = false;
    controls.forEach(control=>control.disabled = false);
  }
}
function renderStats() {
  const keys = new Set(memory.keys());
  try {
    for (let i=0;i<localStorage.length;i++) keys.add(localStorage.key(i));
  } catch { storageAvailable = false; }
  const records = [...keys].filter(key=>key?.startsWith(storageKey)).map(key=>[Number(key.slice(storageKey.length)),load(key)]);
  const {played,streak,distribution} = statsFor(records,utcDay());
  $('played').textContent = played;
  $('streak').textContent = streak;
  const max = Math.max(1,...distribution);
  $('distribution').replaceChildren(...distribution.map((count,score)=>{
    const row = document.createElement('li');
    row.innerHTML = '<span></span><div class="track"><div class="bar"></div></div><strong></strong>';
    row.firstChild.textContent = score;
    row.lastChild.textContent = count;
    row.querySelector('.bar').style.width = 100*count/max+'%';
    row.setAttribute('aria-label',score+' out of 10: '+count+' games');
    return row;
  }));
}
$('guess-form').addEventListener('submit',event=>{
  event.preventDefault();
  guess(resolveGuess(input.value,matches,active));
});
$('guess-form').querySelector('button').addEventListener('pointerdown',event=>{
  if (document.activeElement === input) event.preventDefault();
});
input.addEventListener('input',showSuggestions);
input.addEventListener('focus',showSuggestions);
input.addEventListener('blur',closeSuggestions);
input.addEventListener('keydown',event=>{
  if (event.isComposing || !matches.length) return;
  if (event.key === 'Escape') { closeSuggestions(); return; }
  if (!['ArrowUp','ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  active = active < 0 && event.key === 'ArrowUp' ? matches.length-1
    : (active+(event.key === 'ArrowDown' ? 1 : -1)+matches.length)%matches.length;
  [...list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));
  input.setAttribute('aria-activedescendant',list.children[active].id);
  list.children[active].scrollIntoView({block:'nearest'});
});
$('reveal').addEventListener('click',()=>{
  if (busy || sync()) return;
  if (replayDay === undefined) game = load(storageKey+day);
  if (!finished(game)) return;
  game = {...game,revealed:true};
  save();
  render();
  $('share').focus();
});
$('share').addEventListener('click',async()=>{
  if (busy || sync() || !finished(game)) return;
  const url = location.protocol.startsWith('http') ? new URL('./',location.href).href : '';
  const text = shareText(game,puzzle,replayDay ?? day,url);
  try {
    if (navigator.share) { await navigator.share({text}); return; }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      $('share-status').textContent = 'Result copied.';
      return;
    }
  } catch(error) { if (error.name === 'AbortError') return; }
  const copy = $('share-copy');
  copy.value = text;
  copy.hidden = false;
  copy.focus();
  copy.select();
  $('share-status').textContent = 'Copy the selected result to share it.';
});
function openStats() {
  $('stats-archive').hidden = !canReplay();
  renderStats();
  if (!$('stats').open) $('stats').showModal();
}
$('show-stats').addEventListener('click',()=>{sync();openStats();});
$('stats').addEventListener('click',event=>{
  if (!event.target.closest('button')) $('stats').close();
});
$('stats').addEventListener('close',()=>{
  if (finished(game) && !$('archive').open) $('result-title').focus();
});
$('show-help').addEventListener('click',()=>$('help').showModal());
window.addEventListener('storage',event=>{
  if (busy || sync()) return;
  if (replayDay !== undefined) {
    if ($('stats').open) renderStats();
    return;
  }
  if (event.key === storageKey+day || event.key === null) {
    const wasFinished = finished(game);
    game = load(storageKey+day);
    render();
    if (!wasFinished && finished(game)) openStats();
  }
  else if ($('stats').open) renderStats();
});
function tick() {
  sync();
  const seconds = Math.max(0,Math.ceil(((utcDay()+1)*dayLength-Date.now())/1000));
  const clock = [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
  $('countdown').textContent = 'Next puzzle in '+clock+' · midnight UTC';
}
function canReplay() {
  return utcDay() > launchDay && finished(load(storageKey+utcDay()));
}
function monthStart(value,offset = 0) {
  const date = new Date(value*dayLength);
  return utcDay(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+offset,1));
}
function renderCalendar() {
  const today = utcDay();
  const next = monthStart(month,1);
  $('month-label').textContent = new Intl.DateTimeFormat('en-IE',{month:'long',year:'numeric',timeZone:'UTC'}).format(month*dayLength);
  $('previous-month').disabled = month <= monthStart(launchDay);
  $('next-month').disabled = next >= today;
  const calendar = $('calendar');
  calendar.replaceChildren();
  for (const label of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']) {
    const cell = document.createElement('span');
    cell.textContent = label;
    calendar.append(cell);
  }
  const offset = (new Date(month*dayLength).getUTCDay()+6)%7;
  for (let i=0;i<offset;i++) calendar.append(document.createElement('span'));
  for (let date=month;date<next;date++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = date-month+1;
    button.setAttribute('aria-label',dateFormat.format(date*dayLength));
    button.disabled = date < launchDay || date >= today;
    button.addEventListener('click',()=>{
      replayDay = date;
      $('archive').close();
      showPuzzle(date,newGame());
      $('question').scrollIntoView({block:'start'});
    });
    calendar.append(button);
  }
}
function openArchive() {
  if (busy || !canReplay()) return;
  month = monthStart(utcDay()-1);
  renderCalendar();
  $('stats').close();
  $('archive').showModal();
}
$('stats-archive').addEventListener('click',openArchive);
$('result-archive').addEventListener('click',openArchive);
for (const [id,offset] of [['previous-month',-1],['next-month',1]]) {
  $(id).addEventListener('click',()=>{
    month = monthStart(month,offset);
    renderCalendar();
  });
}
$('return-daily').addEventListener('click',()=>{
  replayDay = undefined;
  day = undefined;
  tick();
  $('question').scrollIntoView({block:'start'});
});
window.addEventListener('focus',tick);
document.addEventListener('visibilitychange',tick);
tick();
setInterval(tick,1000);

