import {dayLength,utcDay,puzzleFor,storageKey,newGame,finished,submit,suggestions,resolveGuess,statsFor,shareText} from './game.mjs';
const $ = id => document.getElementById(id);
const input = $('guess');
const list = $('suggestions');
const board = $('board');
const feedback = $('feedback');
let day, puzzle, game, matches = [], active = -1;
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
  $('result-title').textContent = score === 10 ? 'Perfect ten!' : 'Full time · '+score+'/10';
  $('reveal').hidden = game.revealed || score === 10;
  $('source').hidden = !game.revealed && score !== 10;
  $('source').href = puzzle.source;
  if (ended) closeSuggestions();
  if ($('stats').open) renderStats();
}
function sync() {
  const currentDay = utcDay();
  if (currentDay === day) return false;
  day = currentDay;
  puzzle = puzzleFor(day);
  game = load(storageKey+day);
  $('edition').textContent = 'Daily quiz  /  '+new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(day*dayLength);
  $('question').textContent = puzzle.question;
  $('context').textContent = puzzle.context+(puzzle.choices ? '' : ' · Ties, including the cutoff, go alphabetically');
  $('share-copy').hidden = true;
  $('share-status').textContent = '';
  input.value = '';
  feedback.textContent = storageAvailable ? '' : 'Browser storage is unavailable. Progress lasts while this tab is open.';
  closeSuggestions();
  render();
  return true;
}
function guess(text) {
  if (sync()) {
    feedback.textContent = 'A new puzzle is ready.';
    return;
  }
  game = load(storageKey+day);
  const outcome = submit(game,puzzle,text);
  if (outcome.kind === 'empty') return;
  if (outcome.kind === 'finished') { render(); return; }
  if (outcome.kind === 'unknown') {
    feedback.textContent = puzzle.choices ? 'Choose a player from the list.' : 'Choose a country or rugby team from the list.';
    return;
  }
  if (outcome.kind === 'duplicate') {
    feedback.textContent = 'You already tried that guess.';
    return;
  }
  game = outcome.game;
  feedback.textContent = outcome.kind === 'correct'
    ? outcome.team+' lands at number '+(outcome.rank+1)+'.'
    : 'Outside the top ten. '+(3-game.wrong.length)+' lives left.';
  save();
  input.value = '';
  closeSuggestions();
  render(outcome.rank);
  if (finished(game)) openStats();
  else input.focus();
}
function renderStats() {
  const keys = new Set(memory.keys());
  try {
    for (let i=0;i<localStorage.length;i++) keys.add(localStorage.key(i));
  } catch { storageAvailable = false; }
  const records = [...keys].filter(key=>key?.startsWith(storageKey)).map(key=>[Number(key.slice(storageKey.length)),load(key)]);
  const {played,streak,distribution} = statsFor(records,day);
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
  if (sync()) return;
  game = load(storageKey+day);
  if (!finished(game)) return;
  game = {...game,revealed:true};
  save();
  render();
  $('share').focus();
});
$('share').addEventListener('click',async()=>{
  if (sync() || !finished(game)) return;
  const url = location.protocol.startsWith('http') ? new URL('./',location.href).href : '';
  const text = shareText(game,puzzle,day,url);
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
  renderStats();
  if (!$('stats').open) $('stats').showModal();
}
$('show-stats').addEventListener('click',()=>{sync();openStats();});
$('stats').addEventListener('click',event=>{
  if (!event.target.closest('button')) $('stats').close();
});
$('stats').addEventListener('close',()=>{
  if (finished(game)) $('result-title').focus();
});
$('show-help').addEventListener('click',()=>$('help').showModal());
window.addEventListener('storage',event=>{
  if (sync()) return;
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
  const seconds = Math.max(0,Math.ceil(((day+1)*dayLength-Date.now())/1000));
  const clock = [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
  $('countdown').textContent = 'Next puzzle in '+clock+' · midnight UTC';
}
window.addEventListener('focus',tick);
document.addEventListener('visibilitychange',tick);
tick();
setInterval(tick,1000);

